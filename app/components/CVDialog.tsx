// CVDialog.tsx
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '../../components/ui/dialog';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Loader2, Lock, ExternalLink, FileText, X, Check, Info, Building2, Shield, Edit, Download, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { API_ENDPOINTS } from '../config/api';
import { cn } from '../lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import LoginDialog from './LoginDialog';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider } from '../firebase/firebaseConfig';
import { FcGoogle } from 'react-icons/fc';
import { getAuth } from 'firebase/auth';

interface ModalColors {
  dominant: string;
  dominantLight: string;
}

interface Job {
  id: string;
  title: string;
  company: string | { name: string };
  description: string;
  // ... andra jobbegenskaper
}

interface CVDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  logoUrl?: string;
  jobDescription: string;
  colors?: ModalColors | null;
  job?: Job;
}

interface UserData {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string;
  experience: string;
  education: string;
  certifications: string;
  lastUpdated: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const cvTemplates = [
  { id: 'template1', name: 'Klassisk', thumbnail: '/cv-templates/2.png', description: 'En klassisk CV-mall som passar de flesta.', free: true },
  { id: 'template2', name: 'Modern', thumbnail: '/cv-templates/1.png', description: 'En modern CV-mall som ger ett professionellt intryck.', free: false },
  { id: 'template3', name: 'Kreativ', thumbnail: '/cv-templates/3.png', description: 'En kreativ CV-mall som ger utrymme för personlighet.', free: false },
  { id: 'template4', name: 'Professionell', thumbnail: '/cv-templates/5.png', description: 'En professionell CV-mall som passar för chefer och ledare.', free: false },
];

const templateOptions = [
  { id: 'default', name: 'CV Mall 1' },
  { id: 'modern', name: 'CV Mall 2' },
  { id: 'creative', name: 'CV Mall 3' }
];

export default function CVDialog({ 
  isOpen, 
  onClose, 
  jobTitle, 
  logoUrl,
  jobDescription,
  colors,
  job
}: CVDialogProps) {
  const [user] = useAuthState(auth);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
    certifications: '',
    lastUpdated: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [generatedCVUrl, setGeneratedCVUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingCV, setIsCreatingCV] = useState(false);
  const [loadingText, setLoadingText] = useState('🔍 Analyserar jobbeskrivningen...');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const cachedData = localStorage.getItem('tempUserData');
      if (cachedData) {
        setUserData(JSON.parse(cachedData));
      }
    };

    if (isOpen) {
      setGeneratedCVUrl(null);
      fetchUserData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isCreatingCV) {
      const texts = [
        '🔍 Analyserar jobbeskrivningen...',
        '📝 Skapar CV...',
        '✨ Anpassar innehållet...',
        '🎯 Optimerar formuleringarna...'
      ];
      let currentIndex = 0;

      const interval = setInterval(() => {
        setLoadingText(texts[currentIndex]);
        currentIndex = (currentIndex + 1) % texts.length;
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isCreatingCV]);

  useEffect(() => {
    if (generatedCVUrl && !showInfo) {
      setTimeout(() => {
        setShowInfo(true);
      }, 600);
    }
  }, [generatedCVUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    setIsCreatingCV(true);
    setError(null);

    localStorage.setItem('tempUserData', JSON.stringify(userData));

    const maxRetries = 5;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const texts = [
      '🔍 Analyserar jobbeskrivningen...',
      '📝 Skapar CV...',
      '✨ Anpassar innehållet...',
      '🎯 Optimerar formuleringarna...'
    ];
    let currentIndex = 0;

    const updateLoadingText = () => {
      setLoadingText(texts[currentIndex]);
      currentIndex = (currentIndex + 1) % texts.length;
    };

    // Starta intervallet för att uppdatera laddningstexten
    const loadingInterval = setInterval(updateLoadingText, 2000);
    updateLoadingText(); // Sätt första texten direkt

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const cvData = {
          ...userData,
          jobTitle: jobTitle,
          jobDescription: jobDescription,
          templateId: selectedTemplate,
        };

        const response = await fetch(API_ENDPOINTS.generateCV, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cvData),
        });

        if (!response.ok) {
          if (attempt === maxRetries) {
            throw new Error('Kunde inte generera CV efter flera försök');
          }
          console.log(`Försök ${attempt} misslyckades, försöker igen...`);
          await delay(1000);
          continue;
        }

        // När vi får svaret, stoppa den roterande texten
        clearInterval(loadingInterval);
        setIsCreatingCV(false);

        const result = await response.json();
        
        // Visa "Nästan klart..." i exakt 2 sekunder
        setLoadingText('🚀 Nästan klart...');
        await delay(2000);
        
        const blob = new Blob([result.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setGeneratedCVUrl(url);
        break;
      } catch (err) {
        clearInterval(loadingInterval); // Stoppa intervallet vid fel
        if (attempt === maxRetries) {
          console.error('CV generation error:', err);
          setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod');
        } else {
          console.log(`Försök ${attempt} misslyckades med fel:`, err);
          await delay(1000);
        }
      } finally {
        setIsSubmitting(false);
        setIsCreatingCV(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const openGeneratedCV = () => {
    if (generatedCVUrl) {
      window.open(generatedCVUrl, '_blank');
    }
  };

  const handleCreateCV = async () => {
    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }

    setIsCreatingCV(true);
    try {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSubmit(fakeEvent);
    } finally {
      setTimeout(() => {
        setIsCreatingCV(false);
      }, 1000);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <>
      {/* Overlay när LoginDialog är öppen */}
      {isLoginDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" />
      )}

      {/* LoginDialog */}
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => {
          setIsLoginDialogOpen(false);
          if (user) {
            handleSubmit({ preventDefault: () => {} } as React.FormEvent);
          }
        }}
      />

      {/* Main Dialog */}
      <Dialog
        open={isOpen && !isLoginDialogOpen}
        onOpenChange={onClose}
      >
        <DialogContent 
          className="max-w-4xl w-full h-[90vh] sm:h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-0 gap-0"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            Skapa CV för {jobTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Dialog för att skapa ett CV för tjänsten {jobTitle}
          </DialogDescription>

          {/* Stängknapp */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 z-50 p-2 sm:p-1.5 bg-white hover:bg-gray-100 rounded-full shadow-lg sm:shadow-none border border-gray-200 sm:border-transparent transition-all duration-200 group"
            aria-label="Stäng dialog"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-100 flex-shrink-0" style={{
            background: colors ? `linear-gradient(to bottom, ${colors.dominantLight}, transparent)` : undefined
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {logoUrl ? (
                <div className="relative w-12 h-12 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <Image 
                    src={logoUrl} 
                    alt={`${jobTitle} logotyp`}
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                    className="object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-gray-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate mb-1">
                  Skapar exempel CV
                </h2>
                <p className="text-sm text-gray-600">
                  för tjänsten {jobTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className={cn(
            "flex-1 relative overflow-y-auto",
            generatedCVUrl && "overflow-hidden"
          )}>
            {isSubmitting ? (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative flex flex-col items-center p-8 rounded-2xl bg-white shadow-2xl">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-r-blue-600 animate-[spin_1.5s_linear_infinite]" />
                  </div>
                  <div className="mt-6 text-lg font-medium text-gray-700">
                    {loadingText}
                  </div>
                  <div className="mt-2 text-sm text-gray-500 animate-pulse">
                    Detta kan ta några sekunder
                  </div>
                </div>
              </div>
            ) : !generatedCVUrl && (
              <div className="h-full flex flex-col">
                {/* Original form content */}
                <div className="flex-1 p-4 sm:p-6 space-y-6">
                  {/* CV Templates */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                    <div 
                      className="relative group cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedTemplate("modern");
                      }}
                    >
                      <div className={`relative rounded-lg overflow-hidden aspect-[3/4] ${selectedTemplate === "modern" ? 'ring-4 ring-blue-500 shadow-lg' : 'ring-1 ring-gray-200 hover:ring-blue-300'}`}>
                        <Image
                          src="/cv-templates/2.png"
                          alt="CV Mall 2"
                          fill
                          className="object-contain object-top transform transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className="font-medium text-lg">CV Mall 2</h3>
                        {selectedTemplate === "modern" && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div 
                      className="relative group cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedTemplate("creative");
                      }}
                    >
                      <div className={`relative rounded-lg overflow-hidden aspect-[3/4] ${selectedTemplate === "creative" ? 'ring-4 ring-blue-500 shadow-lg' : 'ring-1 ring-gray-200 hover:ring-blue-300'}`}>
                        <Image
                          src="/cv-templates/3.png"
                          alt="CV Mall 3"
                          fill
                          className="object-contain object-top transform transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className="font-medium text-lg">CV Mall 3</h3>
                        {selectedTemplate === "creative" && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div 
                      className="relative opacity-60 cursor-not-allowed"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <div className="relative rounded-lg overflow-hidden aspect-[3/4]">
                        <Image
                          src="/cv-templates/4.png"
                          alt="Coming Soon Template"
                          fill
                          className="object-contain object-top"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-medium">
                            Kommer snart
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className="font-medium text-lg text-gray-500">Mall 4</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 sm:p-6 bg-white flex-shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Info className="h-4 w-4" />
                      <span>Ditt CV kommer att genereras automatiskt</span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={onClose}
                      >
                        Avbryt
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                      >
                        Skapa CV
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success state */}
          {generatedCVUrl && !isSubmitting && (
            <div className="absolute top-[72px] sm:top-[88px] inset-x-0 bottom-0 flex flex-col items-center justify-center">
              <div className="w-[400px] bg-white rounded-xl shadow-lg p-8 mx-auto text-center">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">CV genererat!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Ditt CV är nu klart att öppnas
                </p>
                <div className="flex flex-col items-start gap-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Edit className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>Detta är ett exempel-CV som du kan redigera lokalt</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Download className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>Du kan ladda ner CV:t när du är klar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>All data lagras lokalt i din webbläsare</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedCVUrl(null);
                      setIsCreatingCV(false);
                    }}
                    className="flex-1"
                  >
                    Skapa nytt
                  </Button>
                  <Button
                    onClick={() => window.open(generatedCVUrl, '_blank')}
                    className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8]"
                  >
                    Öppna CV
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
