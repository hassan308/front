'use client';

import { Job } from '../types';
import { 
  FileText, 
  Send, 
  X, 
  Building2, 
  MapPin, 
  Briefcase, 
  Users, 
  Target, 
  Clock,
  Coins,
  Calendar,
  Timer,
  GraduationCap,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import cn from 'classnames';
import { FastAverageColor } from 'fast-average-color';
import CVDialog from './CVDialog';
import CoverLetterDialog from './CoverLetterDialog';

interface ModalColors {
  dominant: string;
  dominantLight: string;
}

interface JobModalProps {
  job: Job;
  onClose: () => void;
  onCreateCV?: (job: Job) => void;
  onCreateCoverLetter?: (job: Job) => void;
  colors?: ModalColors | null;
}

export default function JobModal({ job, onClose, onCreateCV, onCreateCoverLetter, colors: initialColors }: JobModalProps) {
  const [showCVDialog, setShowCVDialog] = useState(false); 
  const [isVisible, setIsVisible] = useState(true);
  const [shouldShowLogo, setShouldShowLogo] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCoverLetterDialogOpen, setIsCoverLetterDialogOpen] = useState(false);
  const [colors, setColors] = useState<ModalColors | null>(initialColors || null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!job.logotype) {
      setShouldShowLogo(false);
      setColors({
        dominant: '#4F46E5',
        dominantLight: '#4F46E520'
      });
      return;
    }

    const fac = new FastAverageColor();
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = async () => {
      try {
        const color = await fac.getColorAsync(img);
        const dominantColor = color.hex;
        setColors({
          dominant: dominantColor,
          dominantLight: `${dominantColor}20`
        });
      } catch (error) {
        setColors({
          dominant: '#4F46E5',
          dominantLight: '#4F46E520'
        });
      }
    };

    img.onerror = () => {
      setShouldShowLogo(false);
      setColors({
        dominant: '#4F46E5',
        dominantLight: '#4F46E520'
      });
    };

    img.src = job.logotype;

    return () => {
      fac.destroy();
    };
  }, [job.logotype]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const modal = document.getElementById('job-modal-content');
      const cvDialog = document.getElementById('cv-dialog');
      const coverLetterDialog = document.getElementById('cover-letter-dialog');
      const loginDialog = document.querySelector('[role="dialog"]');
      
      // Don't close if click is inside any of the dialogs
      if (cvDialog?.contains(target) || 
          coverLetterDialog?.contains(target) || 
          loginDialog?.contains(target)) {
        return;
      }
      
      // Only close if click is outside both modals
      if (modal && !modal.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateCV = () => {
    setShowCVDialog(true);
    if (onCreateCV) {
      onCreateCV(job);
    }
  };

  const handleCreateCoverLetter = () => {
    setIsCoverLetterDialogOpen(true);
  };

  useEffect(() => {
    if (showCVDialog) {
    }
  }, [showCVDialog, job.logotype, colors]);

  useEffect(() => {
    if (showCVDialog) {
    }
  }, [showCVDialog, job, colors]);

  const getCompanyName = () => {
    if (typeof job.company === 'object' && job.company.name) {
      return job.company.name;
    }
    if (typeof job.company === 'string' && job.company.trim()) {
      return job.company;
    }
    return 'Företagsnamn saknas';
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main JobModal */}
      <div 
        className={cn(
          "fixed inset-0 z-50",
          showCVDialog || isCoverLetterDialogOpen ? "hidden" : "flex items-center justify-center p-4"
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <div
          id="job-modal-content"
          className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Stäng-knapp - Mer framträdande på mobil */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 z-50 p-2 sm:p-1.5 bg-white hover:bg-gray-100 rounded-full shadow-lg sm:shadow-none border border-gray-200 sm:border-transparent transition-all duration-200 group"
            aria-label="Stäng modal"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5 text-gray-600 group-hover:text-gray-800" />
          </button>

          {/* Hörnfärger från logotypen */}
          {colors && (
            <>
              {/* Top gradient covering entire top area */}
              <div 
                className="absolute top-0 left-0 w-full h-72"
                style={{
                  background: `linear-gradient(to bottom, 
                    ${colors.dominant} 0%,
                    ${colors.dominant}95 10%,
                    ${colors.dominant}85 20%,
                    ${colors.dominant}70 30%,
                    ${colors.dominant}50 40%,
                    ${colors.dominant}30 50%,
                    ${colors.dominant}15 60%,
                    ${colors.dominant}05 70%,
                    transparent 100%)`
                }}
              />
            </>
          )}

          {/* Vit mittsektion */}
          <div className="relative">
            {/* Innehåll med solid bakgrund för skarp text */}
            <div className="relative bg-white">
              {/* Header Section */}
              <div className="relative p-4 sm:p-6 border-b border-gray-100" style={{
                background: colors ? `linear-gradient(145deg, ${colors.dominantLight}, transparent 90%)` : undefined,
                boxShadow: colors ? `0 2px 4px ${colors.dominant}10` : undefined
              }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    {shouldShowLogo && job.logotype ? (
                      <NextImage 
                        src={job.logotype} 
                        alt={`${getCompanyName()} logotyp`}
                        width={48}
                        height={48}
                        className="rounded-lg w-12 h-12 object-contain bg-white"
                        style={{
                          boxShadow: colors ? `0 2px 4px ${colors.dominant}30` : undefined
                        }}
                        onError={() => {
                          setShouldShowLogo(false);
                          setColors({
                            dominant: '#4F46E5',
                            dominantLight: '#4F46E520'
                          });
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                           style={{
                             background: colors ? `linear-gradient(135deg, ${colors.dominantLight}, white)` : 'linear-gradient(135deg, #4F46E520, white)'
                           }}>
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate mb-1 text-left">
                      {job.title || 'Jobbtitel saknas'}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-start gap-1.5">
                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-600 text-left">
                          {getCompanyName()}
                        </span>
                      </div>
                      {job.location && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600 text-left">
                            {typeof job.location === 'object' ? job.location.city : job.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="relative flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="relative bg-white p-4 sm:p-6">
              {/* Grid med information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  <div className="bg-white shadow-sm border border-gray-100 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1 font-medium text-left">Anställningsform</div>
                    <div className="flex items-start gap-2 text-sm font-medium text-gray-700">
                      <Briefcase className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span className="text-left">{job.employmentType}</span>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm border border-gray-100 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1 font-medium text-left">Antal tjänster</div>
                    <div className="flex items-start gap-2 text-sm font-medium text-gray-700">
                      <Users className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span className="text-left">{job.positions} st</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white shadow-sm border border-gray-100 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1 font-medium text-left">Erfarenhetskrav</div>
                    <div className="flex items-start gap-2 text-sm font-medium text-gray-700">
                      <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span className="text-left">{job.requiresExperience ? 'Krävs' : 'Krävs ej'}</span>
                    </div>
                  </div>

                  {job.duration && (
                    <div className="bg-white shadow-sm border border-gray-100 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1 font-medium text-left">Varaktighet</div>
                      <div className="flex items-start gap-2 text-sm font-medium text-gray-700">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span className="text-left">{job.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {job.salaryType && (
                  <div className="bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-full flex items-start gap-2">
                    <Coins className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-sm font-medium text-gray-700 text-left">{job.salaryType}</span>
                  </div>
                )}
                <div className="bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-full flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700 text-left">Publicerad: {formatDate(job.publishedDate)}</span>
                </div>
                {job.lastApplicationDate && (
                  <div className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-full flex items-start gap-2">
                    <Timer className="w-4 h-4 text-red-600 mt-0.5" />
                    <span className="text-sm font-medium text-red-700 text-left">Sök senast: {formatDate(job.lastApplicationDate)}</span>
                  </div>
                )}
              </div>

              {/* Description and Requirements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Description */}
                <div className="space-y-6">
                  <div className="prose prose-sm max-w-none text-gray-600 bg-white shadow-sm border border-gray-100 p-3 sm:p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-start gap-2 text-left">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>Beskrivning</span>
                    </h3>
                    <div 
                      className="[&>h1]:text-lg [&>h1]:font-semibold [&>h1]:mb-3 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-3 text-left"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                    
                    {/* Ansökningsknapp under beskrivningen */}
                    {job.application?.webAddress && (
                      <div className="mt-6">
                        <Button
                          onClick={() => window.open(job.application.webAddress, '_blank')}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-6 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Gå till ansökan
                        </Button>
                        <p className="text-sm text-gray-500 mt-2 text-left">
                          Ansökan sker på extern webbplats
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Requirements and Conditions */}
                <div className="space-y-6">
                  {job.requirements && (
                    <div className="prose prose-sm max-w-none text-gray-600 bg-white shadow-sm border border-gray-100 p-3 sm:p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-start gap-2 text-left">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>Kvalifikationer</span>
                      </h3>
                      <div 
                        className="[&>h1]:text-lg [&>h1]:font-semibold [&>h1]:mb-3 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-3 text-left"
                        dangerouslySetInnerHTML={{ __html: job.requirements }}
                      />
                    </div>
                  )}

                  {job.conditions && (
                    <div className="prose prose-sm max-w-none text-gray-600 bg-white shadow-sm border border-gray-100 p-3 sm:p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-start gap-2 text-left">
                        <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>Anställningsvillkor</span>
                      </h3>
                      <div 
                        className="[&>h1]:text-lg [&>h1]:font-semibold [&>h1]:mb-3 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-3 text-left"
                        dangerouslySetInnerHTML={{ __html: job.conditions }}
                      />
                    </div>
                  )}

                  {/* Kontaktpersoner */}
                  {job.contacts && job.contacts.length > 0 && (
                    <div className="bg-white shadow-sm border border-gray-100 p-3 sm:p-4 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 text-left">
                        📞 Kontaktpersoner
                      </h4>
                      <div className="space-y-3">
                        {job.contacts.map((contact, index) => (
                          <div key={index} className="text-sm text-left">
                            <p className="font-medium text-gray-900">{contact.description}</p>
                            {contact.phoneNumber && <p className="text-gray-600">☎️ {contact.phoneNumber}</p>}
                            {contact.email && <p className="text-gray-600">✉️ {contact.email}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative bg-white border-t border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200 group"
                  onClick={handleCreateCV}
                >
                  <div className="flex items-center justify-between w-full relative px-4 py-2">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Skapa CV</span>
                    </div>
                    {isMobile && (
                      <div className="ml-3 bg-gradient-to-r from-white/10 to-white/20 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20 tracking-wide transition-all duration-200 group-hover:bg-white/30">
                        BETA
                      </div>
                    )}
                  </div>
                </Button>
              </div>
              <div className="relative flex-1">
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm transition-all duration-200 group"
                  onClick={handleCreateCoverLetter}
                >
                  <div className="flex items-center justify-between w-full relative px-4 py-2">
                    <div className="flex items-center">
                      <Send className="mr-2 h-4 w-4" />
                      <span>Personligt brev</span>
                    </div>
                    {isMobile && (
                      <div className="ml-3 bg-gradient-to-r from-white/10 to-white/20 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20 tracking-wide transition-all duration-200 group-hover:bg-white/30">
                        BETA
                      </div>
                    )}
                  </div>
                </Button>
              </div>
              {job.application?.webAddress && (
                <Button
                  onClick={() => window.open(job.application.webAddress, '_blank')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Ansök här
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CVDialog */}
      {showCVDialog && (
        <CVDialog
          isOpen={showCVDialog}
          onClose={() => setShowCVDialog(false)}
          jobTitle={job.title}
          logoUrl={job.logotype}
          jobDescription={job.description}
          colors={colors}
          job={job}
        />
      )}

      {/* CoverLetterDialog */}
      <CoverLetterDialog 
        isOpen={isCoverLetterDialogOpen}
        onClose={() => setIsCoverLetterDialogOpen(false)}
        jobTitle={job.title}
        jobDescription={job.description}
        logoUrl={job.logotype}
        colors={colors || undefined}
      />
    </>
  );
}
