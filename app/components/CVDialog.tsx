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
import { Loader2, Lock, ExternalLink, FileText, X, Check, Info, Building2 } from 'lucide-react';
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
  const [selectedTemplate, setSelectedTemplate] = useState(cvTemplates[0].id);
  const [generatedCVUrl, setGeneratedCVUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();  // Förhindra att eventet bubblar upp
    
    const selectedTemplateObj = cvTemplates.find(t => t.id === selectedTemplate);
    if (!selectedTemplateObj?.free) {
      alert('Detta är en PRO-mall. Vänligen uppgradera för att använda denna mall.');
      return;
    }
    setIsSubmitting(true);
    setGeneratedCVUrl(null);

    const cvData = {
      ...userData,
      jobTitle: jobTitle,
      jobDescription: jobDescription,
      template: selectedTemplate,
    };

    try {
      const response = await fetch(API_ENDPOINTS.generateCV, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cvData),
      });

      if (!response.ok) {
        throw new Error('Något gick fel vid generering av CV');
      }

      const result = await response.json();
      const blob = new Blob([result.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setGeneratedCVUrl(url);

    } catch (error) {
      console.error('Fel vid skapande av CV:', error);
      alert('Ett fel uppstod vid generering av CV. Försök igen senare.');
    } finally {
      setIsSubmitting(false);
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
    >
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!isSubmitting && open === false) {
            onClose();
          }
        }}
      >
        <DialogContent className="max-w-4xl w-full h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-0 gap-0">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Välj CV Mall</h3>
                    <span className="text-sm text-gray-500">Välj en mall för ditt CV</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {cvTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          "relative aspect-[210/297] rounded-lg border-2 cursor-pointer overflow-hidden",
                          selectedTemplate === template.id
                            ? "border-blue-600 shadow-md"
                            : "border-gray-200 hover:border-gray-300",
                          !template.free && "opacity-75"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (template.free) {
                            setSelectedTemplate(template.id);
                          }
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                      >
                        <Image
                          src={template.preview}
                          alt={template.name}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                          className="object-contain p-1"
                          priority
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                          <p className="text-sm text-white text-center font-medium">
                            {template.name}
                          </p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                            <Check className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        {!template.free && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-blue-600 px-2 py-0.5 rounded text-xs text-white font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              PRO
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(generatedCVUrl, '_blank');
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      className="w-full sm:w-auto"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Öppna CV
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Genererar...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Skapa CV
                        </>
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
