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
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export default function JobCard({ job, onCreateCV, onCreateCoverLetter, searchKeyword }: JobCardProps) {
  const [shouldShowLogo, setShouldShowLogo] = useState(true);
  const [hasLogoError, setHasLogoError] = useState(false);
  const [colors, setColors] = useState<CardColors>({
    dominant: '#4F46E5',
    dominantLight: '#4F46E520',
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-200'
  });
  const [showModal, setShowModal] = useState(false);
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
        dominantLight: '#4F46E520',
        backgroundColor: 'bg-gray-50',
        textColor: 'text-gray-900',
        borderColor: 'border-gray-200'
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
          dominantLight: `${dominantColor}20`,
          backgroundColor: 'bg-gray-50',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-200'
        });
      } catch (error) {
        console.error('Could not extract colors:', error);
        setColors({
          dominant: '#4F46E5',
          dominantLight: '#4F46E520',
          backgroundColor: 'bg-gray-50',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-200'
        });
      }
    };

    img.onerror = () => {
      if (!isMounted) return;
      // Silent fail for logo loading errors
      setShouldShowLogo(false);
      setHasLogoError(true);
      setColors({
        backgroundColor: 'bg-gray-50',
        textColor: 'text-gray-900',
        borderColor: 'border-gray-200',
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

  return (
    <>
      <div
        className={cn(
          "group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer",
          "p-4 lg:p-5",
          "h-auto lg:h-[240px]"
        )}
        onClick={() => setShowModal(true)}
        style={{
          background: 'white',
          borderTop: colors ? `4px solid ${colors.dominant}` : '4px solid #4F46E5',
          boxShadow: colors ? 
            `0px 2px 4px -2px ${colors.dominantLight},
             0px 4px 6px -1px rgba(0,0,0,0.05)` : 
            '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.05)',
          transform: 'translateY(0)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = colors ?
            `0px 8px 16px -4px ${colors.dominantLight},
             0px 12px 24px -8px rgba(0,0,0,0.1)` :
            '0px 8px 16px -4px rgba(0,0,0,0.1), 0px 12px 24px -8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = colors ?
            `0px 2px 4px -2px ${colors.dominantLight},
             0px 4px 6px -1px rgba(0,0,0,0.05)` :
            '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.05)';
        }}
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          {/* Logo and Company */}
          <div className="flex items-start gap-3">
            <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg bg-white shadow-sm overflow-hidden flex-shrink-0"> 
              {job.logotype && !hasLogoError ? (
                <NextImage 
                  src={job.logotype} 
                  alt={`${getCompanyName()} logotyp`}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain bg-white p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    setShouldShowLogo(false);
                    setHasLogoError(true);
                    setColors({
                      backgroundColor: 'bg-gray-50',
                      textColor: 'text-gray-900',
                      borderColor: 'border-gray-200',
                      dominant: '#4F46E5',
                      dominantLight: '#4F46E520'
                    });
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Building2 className="w-6 h-6 lg:w-7 lg:h-7 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 truncate">{job.title}</h3>
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <Building2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">{getCompanyName()}</span>
              </div>
              {job.workplace?.municipality && (
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{job.workplace.municipality}</span>
                </div>
              )}
            </div>
          </div>

          {/* Job Type Tags */}
          <div className="flex flex-wrap gap-2 -mt-1">
            {job.employment_type && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-sm border border-gray-100">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <span>{job.employment_type}</span>
              </div>
            )}
            {job.positions > 0 && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-sm border border-gray-100">
                {job.positions > 1 ? (
                  <>
                    <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    <span>{job.positions} tjänster</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    <span>1 tjänst</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-20 lg:mb-4">
          <p
            ref={textRef}
            className="text-sm text-gray-600 leading-relaxed line-clamp-3"
            style={{
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box',
              overflow: 'hidden'
            }}
          >
            {stripHtmlTags(job.description)}
          </p>
        </div>

        {/* Footer Info */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0",
          "p-4 lg:p-5 bg-gradient-to-t from-white via-white to-transparent",
          "pt-12 lg:pt-5" // Ökar gradient området på mobil ännu mer
        )}>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-4 lg:items-center">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 lg:flex lg:flex-row lg:gap-6">
              <div className="flex items-center text-gray-600 text-[13px] lg:text-sm">
                <Clock className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{job.duration || 'Tillsvidare'}</span>
              </div>
              <div className="flex items-center text-gray-600 text-[13px] lg:text-sm">
                <GraduationCap className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{job.requiresExperience ? 'Erfarenhet krävs' : 'Ingen erfarenhet krävs'}</span>
              </div>
              {job.published_at && (
                <div className="flex items-center text-gray-600 text-[13px] lg:text-sm col-span-2 lg:col-span-1">
                  <Clock className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Publicerad {formatDate(job.published_at)}</span>
                </div>
              )}
            </div>
            {job.lastApplicationDate && (
              <div className="flex items-center text-red-600 text-[13px] lg:text-sm font-medium lg:ml-auto">
                <Timer className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                <span className="truncate">Sök senast {formatDate(job.lastApplicationDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal with full details */}
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
