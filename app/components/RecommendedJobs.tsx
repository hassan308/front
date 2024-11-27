// RecommendedJobs.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job } from '../types';
import RecommendedJobCard from './RecommendedJobCard';
import { API_ENDPOINTS } from '../config/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import JobModal from './JobModal';

interface RecommendedJobsProps {
  onCreateCV: (job: Job) => void;
  onCreateCoverLetter: (job: Job) => void;
}

const popularSearches = ['Sjuksköterska', 'Systemutvecklare', 'Lärare', 'Undersköterska']

export default function RecommendedJobs({ onCreateCV, onCreateCoverLetter }: RecommendedJobsProps) {
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Kontrollera skärmstorlek
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Hämta jobb en gång
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.recommendedJobs, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Något gick fel vid hämtning av rekommenderade jobb');
        }

        const data = await response.json();
        const jobs = data.jobs || [];
        setRecommendedJobs(jobs.slice(0, 9));
      } catch (error) {
        console.error('Ett fel inträffade:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, []); // Kör bara en gång vid mount

  // Auto-scroll effekt var 7:e sekund
  useEffect(() => {
    const jobsPerPage = isMobile ? 1 : 3;
    if (recommendedJobs.length <= jobsPerPage) return;

    const interval = setInterval(() => {
      setCurrentPage((prevPage) => {
        const maxPage = Math.ceil(recommendedJobs.length / jobsPerPage) - 1;
        return prevPage >= maxPage ? 0 : prevPage + 1;
      });
    }, 7000); // Bläddra var 7:e sekund

    return () => clearInterval(interval);
  }, [recommendedJobs.length, isMobile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const jobsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(recommendedJobs.length / jobsPerPage);
  const currentJobs = recommendedJobs.slice(
    currentPage * jobsPerPage,
    (currentPage + 1) * jobsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Senaste jobb</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1))}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Föregående"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-sm text-gray-600">
              {currentPage + 1} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1))}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Nästa"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {currentJobs.map((job) => (
              <RecommendedJobCard
                key={job.id}
                job={job}
                onCreateCV={onCreateCV}
                onCreateCoverLetter={onCreateCoverLetter}
                onSelect={setSelectedJob}
                isSelected={selectedJob?.id === job.id}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Job Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onCreateCV={onCreateCV}
            onCreateCoverLetter={onCreateCoverLetter}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
