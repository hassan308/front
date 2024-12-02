// CVDialog.tsx
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, Lock, ExternalLink, FileText, X, Check, Info, Building2, Shield, Edit, Download } from 'lucide-react';
import Image from 'next/image';
import { API_ENDPOINTS } from '../config/api';
import { cn } from '../lib/utils';

interface ModalColors {
  dominant: string;
  dominantLight: string;
}

interface CVDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  logoUrl?: string;
  onLoginRequired?: () => void;
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
  { id: 'template1', name: 'Klassisk', preview: '/cv-templates/2.png', free: true },
  { id: 'template2', name: 'Modern', preview: '/cv-templates/1.png', free: false },
  { id: 'template3', name: 'Kreativ', preview: '/cv-templates/3.png', free: false },
  { id: 'template4', name: 'Professionell', preview: '/cv-templates/4.png', free: false },
];

const templateOptions = [
  { id: 'default', name: 'Standard CV' },
  { id: 'modern', name: 'Modern CV' }
];

export default function CVDialog({ 
  isOpen, 
  onClose, 
  jobTitle, 
  logoUrl,
  onLoginRequired,
  jobDescription,
  colors,
  job
}: CVDialogProps) {

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
  const [loadingText, setLoadingText] = useState('');
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
      if (!auth.currentUser) {
        onLoginRequired?.();
        return;
      }

      const cachedData = localStorage.getItem('userData');
      const now = Date.now();

      if (cachedData) {
        const parsedData: UserData = JSON.parse(cachedData);
        if (now - parsedData.lastUpdated < CACHE_DURATION) {
          setUserData(parsedData);
          return;
        }
      }

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const firebaseData = userDoc.data() as Omit<UserData, 'lastUpdated'>;
        const newUserData = {
          ...firebaseData,
          displayName: auth.currentUser.displayName || '',
          email: auth.currentUser.email || '',
          lastUpdated: now,
        };
        setUserData(newUserData);
        localStorage.setItem('userData', JSON.stringify(newUserData));
      }
    };

    if (isOpen) {
      setGeneratedCVUrl(null);
      fetchUserData();
    }
  }, [isOpen, onLoginRequired, jobTitle]);

  useEffect(() => {
    if (isCreatingCV) {
      const texts = [
        '🔍 Analyserar din profil...',
        '📝 Skräddarsyr CV...',
        '✨ Optimerar innehållet...',
        '🎯 Anpassar efter tjänsten...',
        '🚀 Nästan klar...'
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
      // Vänta lite innan vi visar informationen för snyggare animation
      setTimeout(() => {
        setShowInfo(true);
      }, 600);
    }
  }, [generatedCVUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const maxRetries = 5;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
          await delay(1000); // Vänta 1 sekund mellan försök
          continue;
        }

        const result = await response.json();
        const blob = new Blob([result.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setGeneratedCVUrl(url);
        break; // Avbryt loop vid lyckat försök
      } catch (err) {
        if (attempt === maxRetries) {
          console.error('CV generation error:', err);
          setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod');
        } else {
          console.log(`Försök ${attempt} misslyckades med fel:`, err);
          await delay(1000);
        }
      }
    }

    setIsSubmitting(false);
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
    setIsCreatingCV(true);
    try {
      await handleSubmit(new Event('submit'));
    } finally {
      setTimeout(() => {
        setIsCreatingCV(false);
      }, 1000);
    }
  };

  if (!auth.currentUser) {
    return null; 
  }

  return (
    <div 
      id="cv-dialog" 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        !isOpen && "hidden"
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          // Prevent any automatic closing
          return;
        }}
        modal={true}
      >
        <DialogContent 
          className="max-w-4xl w-full h-[90vh] sm:h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-0 gap-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4169E1]/20 via-[#9333EA]/20 to-[#4169E1]/20 rounded-xl animate-pulse" />
                <FileText className="w-24 h-24 text-[#4169E1]" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    <span className="text-[#4169E1]">Smidigt.</span>{' '}
                    <span className="text-[#9333EA]">Smart.</span>{' '}
                    <span className="text-[#4169E1]">Smidra.</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin text-[#4169E1]" />
                  <span>Skapar ditt CV...</span>
                </div>
              </div>
            </div>
          )}
          {generatedCVUrl && !isSubmitting && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 transition-all duration-500">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4169E1]/20 via-[#9333EA]/20 to-[#4169E1]/20 rounded-xl" />
                <FileText className="w-24 h-24 text-[#4169E1]" />
              </div>
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-2xl font-semibold text-gray-900">Ditt CV är klart!</h3>
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-500",
                    isCreatingCV ? "opacity-100 scale-100" : "opacity-0 scale-0"
                  )}>
                    <div className="w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                  </div>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(generatedCVUrl, '_blank');
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    className={cn(
                      "w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all duration-500",
                      isCreatingCV 
                        ? "opacity-0 scale-95 translate-y-2" 
                        : "opacity-100 scale-100 translate-y-0 hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-center justify-center space-x-2 px-4 py-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Öppna CV</span>
                    </div>
                  </Button>
                </div>
                
                <div className={cn(
                  "flex flex-col space-y-3 transition-all duration-500 transform",
                  showInfo 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                )}>
                  <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="mt-1 text-blue-500">
                      <Shield className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Säker hantering:</span> Ditt CV sparas lokalt på din enhet och lagras inte i våra system.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="mt-1 text-blue-500">
                      <Edit className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Redigerbar:</span> När CV:t öppnas i nästa flik kan du enkelt anpassa och redigera innehållet efter dina önskemål.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="mt-1 text-blue-500">
                      <Download className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Ladda ner:</span> Spara ditt CV som PDF eller dela det direkt med arbetsgivaren.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="relative p-4 sm:p-6 border-b border-gray-100 flex-shrink-0" style={{
              background: colors ? `linear-gradient(to bottom, ${colors.dominantLight}, transparent)` : undefined
            }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {(job?.logotype || logoUrl) ? (
                  <div className="relative w-12 h-12 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <Image 
                      src={job?.logotype || logoUrl || ''} 
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
                    Skapa CV
                  </h2>
                  <p className="text-sm text-gray-600">
                    för tjänsten {jobTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Personlig information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Namn</Label>
                    <Input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={userData.displayName}
                      onChange={handleInputChange}
                      placeholder="Ditt namn"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      placeholder="Din e-postadress"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      placeholder="Ditt telefonnummer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Erfarenhet</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={userData.experience}
                      onChange={handleInputChange}
                      placeholder="Beskriv din relevanta erfarenhet"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Textfält */}
                <div className="space-y-4">
                  {[
                    { id: 'bio', label: 'Sammanfattning', rows: 3 },
                    { id: 'skills', label: 'Färdigheter', rows: 3 },
                    { id: 'education', label: 'Utbildning', rows: 3 },
                    { id: 'certifications', label: 'Certifieringar', rows: 3 }
                  ].map((field) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <Textarea
                        id={field.id}
                        name={field.id}
                        value={userData[field.id as keyof typeof userData] as string}
                        onChange={handleInputChange}
                        rows={field.rows}
                        className="w-full resize-none"
                      />
                    </div>
                  ))}
                </div>

                {/* CV Templates */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                  <div className="relative group cursor-pointer" onClick={() => setSelectedTemplate("default")}>
                    <div className={`relative rounded-lg overflow-hidden ${selectedTemplate === "default" ? 'ring-2 ring-blue-500' : ''}`}>
                      <Image
                        src="/cv-templates/1.png"
                        alt="Standard CV Template"
                        width={250}
                        height={354}
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                    </div>
                    <div className="mt-2 text-center">
                      <h3 className="font-medium">Standard</h3>
                      {selectedTemplate === "default" && (
                        <span className="text-blue-500 text-sm">Vald</span>
                      )}
                    </div>
                  </div>

                  <div className="relative group cursor-pointer" onClick={() => setSelectedTemplate("modern")}>
                    <div className={`relative rounded-lg overflow-hidden ${selectedTemplate === "modern" ? 'ring-2 ring-blue-500' : ''}`}>
                      <Image
                        src="/cv-templates/2.png"
                        alt="Modern CV Template"
                        width={250}
                        height={354}
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                    </div>
                    <div className="mt-2 text-center">
                      <h3 className="font-medium">Modern</h3>
                      {selectedTemplate === "modern" && (
                        <span className="text-blue-500 text-sm">Vald</span>
                      )}
                    </div>
                  </div>

                  {[3, 4].map((index) => (
                    <div key={index} className="relative opacity-60 cursor-not-allowed">
                      <div className="relative rounded-lg overflow-hidden">
                        <Image
                          src={`/cv-templates/${index}.png`}
                          alt="Coming Soon Template"
                          width={250}
                          height={354}
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-medium">
                            Kommer snart
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <h3 className="font-medium text-gray-500">Mall {index - 1}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer med knappar */}
            <div className="border-t border-gray-100 p-4 sm:p-6 bg-white flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>Ditt CV kommer att genereras automatiskt</span>
                </div>
                <div className="flex gap-3">
                  {generatedCVUrl ? (
                    <div className="space-y-4 w-full">
                      <div className="relative">
                        <div className={cn(
                          "absolute inset-0 flex items-center justify-center transition-all duration-500",
                          isCreatingCV ? "opacity-100 scale-100" : "opacity-0 scale-0"
                        )}>
                          <div className="w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                        </div>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(generatedCVUrl, '_blank');
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          onPointerUp={(e) => e.stopPropagation()}
                          className={cn(
                            "w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all duration-500",
                            isCreatingCV 
                              ? "opacity-0 scale-95 translate-y-2" 
                              : "opacity-100 scale-100 translate-y-0 hover:scale-[1.02] active:scale-[0.98]"
                          )}
                        >
                          <div className="flex items-center justify-center space-x-2 px-4 py-2">
                            <ExternalLink className="h-4 w-4" />
                            <span>Öppna CV</span>
                          </div>
                        </Button>
                      </div>
                      
                      <div className={cn(
                        "flex flex-col space-y-3 transition-all duration-500 transform",
                        showInfo 
                          ? "opacity-100 translate-y-0" 
                          : "opacity-0 translate-y-4"
                      )}>
                        <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="mt-1 text-blue-500">
                            <Shield className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">Säker hantering:</span> Ditt CV sparas lokalt på din enhet och lagras inte i våra system.
                          </p>
                        </div>
                        
                        <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="mt-1 text-blue-500">
                            <Edit className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">Redigerbar:</span> När CV:t öppnas i nästa flik kan du enkelt anpassa och redigera innehållet efter dina önskemål.
                          </p>
                        </div>

                        <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="mt-1 text-blue-500">
                            <Download className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">Ladda ner:</span> Spara ditt CV som PDF eller dela det direkt med arbetsgivaren.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      type="button"
                      className={cn(
                        "w-full sm:w-auto relative bg-gradient-to-r text-white shadow-lg transition-all duration-300",
                        isCreatingCV 
                          ? "from-blue-400 to-blue-500 cursor-wait" 
                          : "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      )}
                      disabled={isCreatingCV}
                      onClick={handleCreateCV}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center min-h-[28px] px-4 py-2 relative">
                        {isCreatingCV ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium whitespace-nowrap">{loadingText}</span>
                              <span className="text-[10px] text-white/80 whitespace-nowrap">Det kan ta någon minut...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Skapa CV</span>
                          </div>
                        )}
                      </div>
                      {isCreatingCV && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-500/10 animate-pulse rounded-md pointer-events-none" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
