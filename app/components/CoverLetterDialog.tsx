import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { Button } from "../../components/ui/button"
import { API_ENDPOINTS } from '../config/api'
import { X, FileText, Building2, Loader2, ExternalLink, Shield, Edit, Download, Check, Info } from 'lucide-react'
import Image from 'next/image'
import { cn } from '../lib/utils'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import LoginDialog from './LoginDialog';

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

const templates = [
  { id: 'template1', name: 'Modern', thumbnail: '/cv-templates/4.png', description: 'En modern mall som passar de flesta.', free: true },
  { id: 'template2', name: 'Klassisk', thumbnail: '/cv-templates/5.png', description: 'En klassisk mall som ger ett professionellt intryck.', free: false },
  { id: 'template3', name: 'Kreativ', thumbnail: '/cv-templates/6.png', description: 'En kreativ mall som ger utrymme för personlighet.', free: false },
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
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  const [generatedLetterUrl, setGeneratedLetterUrl] = useState<string | null>(null);
  const [isCreatingLetter, setIsCreatingLetter] = useState(false);
  const [loadingText, setLoadingText] = useState('🔍 Analyserar jobbeskrivningen...');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (generatedLetterUrl && !showInfo) {
      setTimeout(() => {
        setShowInfo(true);
      }, 600);
    }
  }, [generatedLetterUrl]);

  useEffect(() => {
    if (isCreatingLetter) {
      const texts = [
        '🔍 Analyserar jobbeskrivningen...',
        '📝 Skapar personligt brev...',
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
  }, [isCreatingLetter]);

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }

    setIsLoading(true);
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
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
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
          className="max-w-4xl w-full h-[90vh] sm:h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-0 gap-0"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            Skapa personligt brev för {jobTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Dialog för att skapa ett personligt brev för tjänsten {jobTitle}
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
                  Skapar exempel personligt brev
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
            generatedLetterUrl && "overflow-hidden"
          )}>
            {isCreatingLetter ? (
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
            ) : !generatedLetterUrl && (
              <div className="h-full flex flex-col">
                {/* Original form content */}
                <div className="flex-1 p-4 sm:p-6 space-y-6">
                  {/* Template Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className={cn(
                          "relative group",
                          template.free ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (template.free) {
                            setSelectedTemplate(template.id);
                          }
                        }}
                      >
                        <div className={`relative rounded-lg overflow-hidden aspect-[3/4] ${template.free && selectedTemplate === template.id ? 'ring-4 ring-blue-500 shadow-lg' : 'ring-1 ring-gray-200 hover:ring-blue-300'}`}>
                          <Image
                            src={template.thumbnail}
                            alt={template.name}
                            fill
                            className="object-contain object-top transform transition-transform duration-300 group-hover:scale-105"
                          />
                          {template.free && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                          {!template.free && (
                            <>
                              <div className="absolute inset-0 bg-black bg-opacity-20" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-medium">
                                  Kommer snart
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <h3 className="font-medium text-lg">{template.name}</h3>
                          {template.free && selectedTemplate === template.id && (
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 sm:p-6 bg-white flex-shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Info className="h-4 w-4" />
                      <span>Ditt personliga brev kommer att genereras automatiskt</span>
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
                        disabled={isCreatingLetter}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                      >
                        Skapa brev
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success state */}
          {generatedLetterUrl && !isCreatingLetter && (
            <div className="absolute top-[72px] sm:top-[88px] inset-x-0 bottom-0 flex flex-col items-center justify-center">
              <div className="w-[400px] bg-white rounded-xl shadow-lg p-8 mx-auto text-center">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Personligt brev genererat!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Ditt personliga brev är nu klart att öppnas
                </p>
                <div className="flex flex-col items-start gap-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Edit className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>Detta är ett exempel-brev som du kan redigera lokalt</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Download className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>Du kan ladda ner brevet när du är klar</span>
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
                      setGeneratedLetterUrl(null);
                      setIsCreatingLetter(false);
                    }}
                    className="flex-1"
                  >
                    Skapa nytt
                  </Button>
                  <Button
                    onClick={() => window.open(generatedLetterUrl, '_blank')}
                    className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8]"
                  >
                    Öppna brev
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