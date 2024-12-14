import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogHeader } from '../../components/ui/dialog'
import { Button } from "../../components/ui/button"
import { API_ENDPOINTS } from '../config/api'
import { X, FileText, Building2, Loader2, ExternalLink, Shield, Edit, Download, Check, Info } from 'lucide-react'
import NextImage from 'next/image'
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Label } from "../../components/ui/label"
import { cn } from '../lib/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import LoginDialog from './LoginDialog';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider } from '../firebase/firebaseConfig';
import { FcGoogle } from 'react-icons/fc';
import { getAuth } from 'firebase/auth';

interface CoverLetterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobDescription: string;
  logoUrl?: string;
  colors?: {
    dominant: string;
    dominantLight: string;
  };
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  available: boolean;
}

const templates: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'En modern och professionell mall med rena linjer och tydlig struktur.',
    preview: '/cv-templates/4.png',
    available: true
  },
  {
    id: 'classic',
    name: 'Klassisk',
    description: 'En tidlös och elegant mall som passar för traditionella branscher.',
    preview: '/cv-templates/5.png',
    available: false
  },
  {
    id: 'creative',
    name: 'Kreativ',
    description: 'En dynamisk mall designad för kreativa branscher.',
    preview: '/cv-templates/6.png',
    available: false
  }
];

export default function CoverLetterDialog({ 
  isOpen, 
  onClose, 
  jobTitle, 
  jobDescription,
  logoUrl,
  colors = {
    dominant: '#4F46E5',
    dominantLight: '#4F46E520'
  }
}: CoverLetterDialogProps) {
  const [user] = useAuthState(auth);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowLogo, setShouldShowLogo] = useState(!!logoUrl);
  const [selectedTemplate, setSelectedTemplate] = useState('creative');
  const [generatedLetterUrl, setGeneratedLetterUrl] = useState<string | null>(null);
  const [isCreatingLetter, setIsCreatingLetter] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (generatedLetterUrl && !showInfo) {
      setTimeout(() => {
        setShowInfo(true);
      }, 600);
    }
  }, [generatedLetterUrl]);

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsCreatingLetter(true);

    const maxRetries = 5;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const texts = [
      '🔍 Analyserar jobbeskrivningen...',
      '📝 Skapar personligt brev...',
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
        const response = await fetch(API_ENDPOINTS.generateCoverLetter, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId: selectedTemplate,
            jobTitle,
            jobDescription,
          }),
        });

        if (!response.ok) {
          if (attempt === maxRetries) {
            throw new Error('Kunde inte generera personligt brev');
          }
          console.log(`Försök ${attempt} misslyckades, försöker igen...`);
          await delay(1000);
          continue;
        }

        const result = await response.json();
        
        // Stoppa den roterande texten
        clearInterval(loadingInterval);
        
        // Visa "Nästan klart..." i exakt 2 sekunder
        setLoadingText('🚀 Nästan klart...');
        await delay(2000);
        
        const blob = new Blob([result.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setGeneratedLetterUrl(url);
        setIsCreatingLetter(false);
        break;
      } catch (error) {
        clearInterval(loadingInterval);
        if (attempt === maxRetries) {
          console.error('Error:', error);
          setError(error instanceof Error ? error.message : 'Ett fel uppstod');
        } else {
          console.log(`Försök ${attempt} misslyckades med fel:`, error);
          await delay(1000);
        }
      } finally {
        setIsLoading(false);
      }
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
            handleSubmit();
          }
        }}
      />

      {/* Main Dialog */}
      <Dialog 
        open={isOpen && !isLoginDialogOpen} 
        onOpenChange={onClose}
      >
        <DialogContent 
          id="cover-letter-dialog"
          className="max-w-4xl w-full h-[90vh] sm:h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-0 gap-0"
        >
          <DialogTitle asChild>
            <VisuallyHidden>
              Skapa Personligt Brev för {jobTitle}
            </VisuallyHidden>
          </DialogTitle>
          
          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-100 flex-shrink-0" style={{
            background: colors ? `linear-gradient(to bottom, ${colors.dominantLight}, transparent)` : undefined
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {logoUrl ? (
                <div className="relative w-12 h-12 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <NextImage 
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
                  Skapar exempel personligt brev
                </h2>
                <p className="text-sm text-gray-600">
                  för tjänsten {jobTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            {isCreatingLetter ? (
              <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="relative flex flex-col items-center p-8 rounded-2xl bg-white shadow-2xl">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-r-blue-600 animate-[spin_1.5s_linear_infinite]" />
                  </div>
                  <div className="mt-6 text-lg font-medium text-gray-700">
                    {loadingText || 'Skapar personligt brev...'}
                  </div>
                  <div className="mt-2 text-sm text-gray-500 animate-pulse">
                    Detta kan ta några sekunder
                  </div>
                </div>
              </div>
            ) : generatedLetterUrl ? (
              <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="relative flex flex-col items-center p-8 rounded-2xl bg-white shadow-2xl">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Personligt brev genererat!</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Ditt personliga brev är nu klart att öppnas
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Edit className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-left">Detta är ett exempel-personligt brev som du kan redigera lokalt</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Download className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-left">Du kan ladda ner personligt brevet när du är klar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-left">All data lagras lokalt i din webbläsare</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGeneratedLetterUrl(null);
                        setIsCreatingLetter(false);
                      }}
                    >
                      Skapa nytt
                    </Button>
                    <Button
                      onClick={() => window.open(generatedLetterUrl, '_blank')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                    >
                      Öppna brev
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-6">
                {/* Template Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      className={cn(
                        "relative group",
                        template.available ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (template.available) {
                          setSelectedTemplate(template.id);
                        }
                      }}
                    >
                      <div className={cn(
                        "relative rounded-lg overflow-hidden",
                        template.available && selectedTemplate === template.id ? 'ring-4 ring-blue-500 shadow-lg' : 'ring-1 ring-gray-200 hover:ring-blue-300'
                      )}>
                        <NextImage
                          src={template.preview}
                          alt={template.name}
                          width={300}
                          height={424}
                          className={cn(
                            "w-full h-auto",
                            template.available && "transform transition-all duration-500 ease-in-out group-hover:scale-110"
                          )}
                        />
                        {!template.available && (
                          <>
                            <div className="absolute inset-0 bg-black bg-opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-medium">
                                Kommer snart
                              </span>
                            </div>
                          </>
                        )}
                        {template.available && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className={cn(
                          "font-medium text-lg",
                          !template.available && "text-gray-500"
                        )}>
                          {template.name}
                        </h3>
                        {template.available && selectedTemplate === template.id && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 sm:p-6 bg-white flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4" />
                <span>Ditt personliga brev kommer att genereras automatiskt</span>
              </div>
              {!generatedLetterUrl && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreatingLetter(false);
                      onClose();
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isCreatingLetter || isLoading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                  >
                    Skapa brev
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stäng-knapp */}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-purple-100 data-[state=open]:text-purple-500">
            <X className="h-4 w-4" />
            <span className="sr-only">Stäng</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}