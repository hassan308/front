// JobCard.tsx
import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Building2,
  MapPin,
  Briefcase,
  Users,
  User,
  Target,
  Clock,
  Coins,
  Calendar,
  Timer,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { Job } from '../types';
import { FastAverageColor } from 'fast-average-color';
import NextImage from 'next/image';
import JobModal from './JobModal';
import { cn } from '../lib/utils';

interface JobCardProps {
  job: Job;
  onCreateCV: (job: Job) => void;
  onCreateCoverLetter: (job: Job) => void;
  searchKeyword?: string;
}

interface CardColors {
  dominant: string;
  dominantLight: string;
}

export default function JobCard({ job, onCreateCV, onCreateCoverLetter, searchKeyword }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowLogo, setShouldShowLogo] = useState(true);
  const [hasLogoError, setHasLogoError] = useState(false);
  const [colors, setColors] = useState<CardColors>({
    dominant: '#4F46E5',
    dominantLight: '#4F46E520'
  });
  const [showModal, setShowModal] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getCompanyName = () => {
    if (typeof job.company === 'object' && job.company.name) {
      return job.company.name;
    }
    if (typeof job.company === 'string' && job.company.trim()) {
      return job.company;
    }
    return 'Företagsnamn saknas';
  };

  useEffect(() => {
    if (!job.logotype || hasLogoError) {
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
    let isMounted = true;

    img.onload = async () => {
      if (!isMounted) return;
      try {
        const color = await fac.getColorAsync(img);
        const dominantColor = color.hex;
        setColors({
          dominant: dominantColor,
          dominantLight: `${dominantColor}20`
        });
      } catch (error) {
        console.error('Could not extract colors:', error);
        setColors({
          dominant: '#4F46E5',
          dominantLight: '#4F46E520'
        });
      }
    };

    img.onerror = () => {
      if (!isMounted) return;
      console.error('Failed to load logo:', job.logotype);
      setShouldShowLogo(false);
      setHasLogoError(true);
      setColors({
        dominant: '#4F46E5',
        dominantLight: '#4F46E520'
      });
    };

    img.src = job.logotype;

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
      fac.destroy();
    };
  }, [job.logotype, hasLogoError]);

  useEffect(() => {
    const checkTextTruncation = () => {
      const element = textRef.current;
      if (element) {
        setIsTextTruncated(element.scrollHeight > element.clientHeight);
      }
    };

    checkTextTruncation();
    window.addEventListener('resize', checkTextTruncation);
    return () => window.removeEventListener('resize', checkTextTruncation);
  }, [job.description]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div
        className={cn(
          "group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer",
          isExpanded ? "sm:h-auto" : "sm:h-[280px]"
        )}
        onClick={() => setShowModal(true)}
        style={{
          background: 'white',
          borderLeft: colors ? `3px solid ${colors.dominant}20` : '3px solid transparent',
          boxShadow: colors ? 
            `0px 2px 4px -2px ${colors.dominant}30,
             0px 4px 6px -1px rgba(0,0,0,0.05)` : 
            '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.05)',
          transform: 'translateY(0)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = colors ?
            `0px 4px 6px -1px ${colors.dominant}30,
             0px 8px 8px -4px rgba(0,0,0,0.05)` :
            '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 8px 8px -4px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = colors ?
            `0px 2px 4px -2px ${colors.dominant}30,
             0px 4px 6px -1px rgba(0,0,0,0.05)` :
            '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.05)';
        }}
      >
        {/* Header gradient */}
        <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
             style={{
               background: colors ? `linear-gradient(to bottom, 
                 ${colors.dominant}30,
                 ${colors.dominant}20,
                 ${colors.dominant}10,
                 ${colors.dominant}05,
                 transparent 70%)` : undefined
             }}
        />
        
        <div className="flex flex-col sm:flex-row p-4 sm:p-5 gap-4 h-full relative">
          {/* Logo section */}
          <div className="flex-shrink-0 w-12 h-12 relative overflow-hidden rounded-lg bg-white shadow-sm"> 
            <div className="flex items-center space-x-3">
              {job.logotype && !hasLogoError ? (
                <NextImage 
                  src={job.logotype} 
                  alt={`${getCompanyName()} logotyp`}
                  width={48}
                  height={48}
                  className="rounded-lg w-12 h-12 object-contain bg-white p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    setShouldShowLogo(false);
                    setHasLogoError(true);
                    setColors({
                      dominant: '#4F46E5',
                      dominantLight: '#4F46E520'
                    });
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-gray-700 text-sm sm:text-base">
              <Building2 className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="truncate font-semibold">{getCompanyName()}</span>
            </div>
            {job.workplace?.municipality && (
              <div className="flex items-center text-gray-700 text-sm sm:text-base">
                <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <span className="truncate">{job.workplace.municipality}</span>
              </div>
            )}
            {job.employment_type && (
              <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{job.employment_type}</span>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="flex-1 min-w-0 flex flex-col h-full relative">
            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
              <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">
                  {job.duration || 'Tillsvidare'}
                </span>
              </div>

              <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">
                  {job.requiresExperience ? 'Erfarenhet krävs' : 'Ingen erfarenhet krävs'}
                </span>
              </div>

              {job.positions > 0 && (
                <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                  {job.positions > 1 ? (
                    <>
                      <Users className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{job.positions} tjänster</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                      <span className="truncate">1 tjänst</span>
                    </>
                  )}
                </div>
              )}

              {job.published_at && (
                <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                  <span className="truncate">Publicerad {formatDate(job.published_at)}</span>
                </div>
              )}
            </div>

            {/* Deadline */}
            {job.lastApplicationDate && (
              <div className="mb-3">
                <div className="inline-flex items-center text-red-600 text-xs sm:text-sm bg-red-50 px-2.5 py-1.5 rounded-md">
                  <Timer className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span>Sök senast {formatDate(job.lastApplicationDate)}</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="flex-1">
              <p
                ref={textRef}
                className={cn(
                  "text-sm text-gray-600 leading-relaxed",
                  !isExpanded && "line-clamp-3 sm:line-clamp-4"
                )}
                style={{ marginBottom: isTextTruncated ? '0.5rem' : '0' }}
              >
                {stripHtmlTags(job.description)}
              </p>
              {isTextTruncated && (
                <div className="mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Visa mindre
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        Visa mer
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <JobModal 
          job={job}
          onClose={() => setShowModal(false)}
          onCreateCV={onCreateCV}
          onCreateCoverLetter={onCreateCoverLetter}
          colors={colors}
        />
      )}
    </>
  );
}
