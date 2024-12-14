// RecommendedJobCard.tsx
import { Job } from '../types';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, PenLine, MapPin, Building2, Calendar, Briefcase, Clock } from 'lucide-react';
import { FastAverageColor } from 'fast-average-color';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecommendedJobCardProps {
  job: Job;
  onCreateCV?: (job: Job) => void;
  onCreateCoverLetter?: (job: Job) => void;
  onSelect: (job: Job) => void;
  isSelected: boolean;
}

export default function RecommendedJobCard({ 
  job, 
  onCreateCV, 
  onCreateCoverLetter,
  onSelect,
  isSelected 
}: RecommendedJobCardProps) {
  const [colors, setColors] = useState<{dominant: string; dominantLight: string} | null>(null);

  useEffect(() => {
    if (job.logotype) {
      const fac = new FastAverageColor();
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = job.logotype;
      
      img.onload = async () => {
        try {
          const color = await fac.getColorAsync(img);
          const dominantColor = color.hex;
          setColors({
            dominant: dominantColor,
            dominantLight: `${dominantColor}15`
          });
        } catch (error) {
          setColors({
            dominant: '#4F46E5',
            dominantLight: '#4F46E515'
          });
        }
      };

      img.onerror = () => {
        setColors({
          dominant: '#4F46E5',
          dominantLight: '#4F46E515'
        });
      };

      return () => {
        fac.destroy();
      };
    }
  }, [job.logotype]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tillsvidare';
      }
      
      const day = date.getDate();
      const month = date.toLocaleString('sv-SE', { month: 'short' });
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch {
      return 'Tillsvidare';
    }
  };

  const truncateDescription = (text: string, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <>
      <motion.div
        className={cn(
          "group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer hover:scale-[1.02]",
          "h-[420px]"
        )}
        onClick={() => onSelect(job)}
      >
        {/* Bakgrundsgradient från logotypen */}
        {colors && (
          <>
            <div 
              className={cn(
                "absolute top-0 left-0 w-full h-72 opacity-90 blur-md"
              )}
              style={{
                background: `linear-gradient(to bottom, 
                  ${colors.dominant}, 
                  ${colors.dominant} 10%,
                  ${colors.dominant} 20%,
                  ${colors.dominant}90 40%,
                  ${colors.dominant}60 60%,
                  ${colors.dominant}20 80%,
                  transparent 100%)`
              }}
            />
          </>
        )}

        {/* Innehåll */}
        <div className={cn(
          "relative h-full flex flex-col"
        )}>
          <div className={cn(
            "relative bg-white/80 flex-1"
          )}>
            {/* Header med företagsinfo */}
            <div className={cn(
              "p-4 sm:p-6"
            )}>
              <div className={cn(
                "flex items-start gap-4"
              )}>
                {job.logotype ? (
                  <div className={cn(
                    "relative w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 group-hover:shadow-md transition-shadow flex-shrink-0"
                  )}>
                    <Image 
                      src={job.logotype} 
                      alt={job.company.name}
                      fill
                      sizes="(max-width: 640px) 48px, 64px"
                      className={cn(
                        "object-contain p-2"
                      )}
                    />
                  </div>
                ) : (
                  <div className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow flex-shrink-0"
                  )}>
                    <Building2 className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 text-blue-500"
                    )} />
                  </div>
                )}
                
                <div className={cn(
                  "flex-1 min-w-0"
                )}>
                  <h3 className={cn(
                    "text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 text-left"
                  )}>
                    {job.title}
                  </h3>
                  <div className={cn(
                    "flex flex-col gap-2 text-left w-full"
                  )}>
                    <div className={cn(
                      "flex items-start gap-1.5 text-sm text-gray-600 w-full"
                    )}>
                      <Building2 className={cn(
                        "w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                      )} />
                      <span className={cn(
                        "truncate text-left flex-1"
                      )}>{job.company.name}</span>
                    </div>
                    <div className={cn(
                      "flex items-start gap-1.5 text-sm text-gray-600 w-full"
                    )}>
                      <MapPin className={cn(
                        "w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                      )} />
                      <span className={cn(
                        "truncate text-left flex-1"
                      )}>{job.workplace?.municipality || 'Plats ej angiven'}</span>
                    </div>
                    <div className={cn(
                      "flex items-start gap-1.5 text-sm text-gray-600 w-full"
                    )}>
                      <Briefcase className={cn(
                        "w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                      )} />
                      <span className={cn(
                        "truncate text-left flex-1"
                      )}>{job.employmentType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kort beskrivning */}
              <div className={cn(
                "mt-4 text-sm text-gray-600 line-clamp-3 text-left w-full"
              )}>
                <div dangerouslySetInnerHTML={{ __html: job.description || 'Ingen beskrivning tillgänglig.' }} />
              </div>

              {/* Badges */}
              <div className={cn(
                "flex flex-wrap gap-2 mt-4 justify-start w-full"
              )}>
                {job.salaryType && (
                  <div className={cn(
                    "inline-flex items-start px-2.5 py-1 rounded-full text-xs font-medium text-blue-700 border border-blue-100 bg-blue-50"
                  )}>
                    <span className="text-left">{job.salaryType}</span>
                  </div>
                )}
                {job.positions > 1 && (
                  <div className={cn(
                    "inline-flex items-start px-2.5 py-1 rounded-full text-xs font-medium text-green-700 border border-green-100 bg-green-50"
                  )}>
                    <span className="text-left">{job.positions} tjänster</span>
                  </div>
                )}
                {job.duration && (
                  <div className={cn(
                    "inline-flex items-start px-2.5 py-1 rounded-full text-xs font-medium text-purple-700 border border-purple-100 bg-purple-50"
                  )}>
                    <span className="text-left">{job.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer med deadline och knapp */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 mt-3 pt-3 border-t border-gray-100 px-4 sm:px-6 pb-4 sm:pb-6 bg-white"
            )}>
              <div className={cn(
                "flex items-start gap-1.5 text-sm text-gray-600 mb-3 w-full"
              )}>
                <Calendar className={cn(
                  "w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                )} />
                <span className="text-left flex-1">Sista ansökningsdag: {job.lastApplicationDate ? formatDate(job.lastApplicationDate) : 'Ej angivet'}</span>
              </div>
              <button 
                onClick={() => onSelect(job)}
                className={cn(
                  "w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                )}
              >
                <span className="text-center">Visa annons</span>
                <ArrowRight className={cn(
                  "w-4 h-4 transition-transform group-hover:translate-x-1"
                )} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
