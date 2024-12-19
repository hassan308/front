// joblist.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import JobCard from './JobCard';
import Pagination from './Pagination';
import { Job } from '../types';
import CVDialog from './CVDialog';
import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { Filter, X, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JobListProps {
  jobs: Job[] | { jobs: Job[] };
  onCreateCV: (job: Job) => void;
  onCreateCoverLetter: (job: Job) => void;
  initialKeyword?: string;
  initialLocation?: string;
  onSearch?: (keyword: string, location?: string) => void;
  isAiMode?: boolean;
  onAiModeToggle?: () => void;
}

export default function JobList({ 
  jobs, 
  onCreateCV, 
  onCreateCoverLetter, 
  initialKeyword = '',
  initialLocation = '',
  onSearch,
  isAiMode = false,
  onAiModeToggle
}: JobListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCVDialogOpen, setIsCVDialogOpen] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [activeFilters, setActiveFilters] = useState<{
    employmentType: string[];
    location: string[];
    experience: string[];
  }>({
    employmentType: [],
    location: [],
    experience: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState('');

  const jobsPerPage = 10;

  // Ensure jobs is an array and all items are valid
  const jobsArray = useMemo(() => {
    const array = Array.isArray(jobs) ? jobs : (jobs as any)?.jobs || [];
    return array.filter((job): job is Job => 
      job !== null && 
      job !== undefined && 
      typeof job === 'object' &&
      'id' in job
    );
  }, [jobs]);

  // Get unique values for filters
  const uniqueFilters = useMemo(() => {
    return {
      employmentType: [...new Set(jobsArray.map(job => job.employment_type))].filter(Boolean),
      location: [...new Set(jobsArray.map(job => job.workplace?.municipality))].filter(Boolean),
      experience: [...new Set(['Erfarenhet krävs', 'Ingen erfarenhet krävs'])]
    };
  }, [jobsArray]);

  // Apply filters
  useEffect(() => {
    let filtered = jobsArray;

    // Sök i tabellen
    if (tableSearchTerm.trim()) {
      const searchLower = tableSearchTerm.toLowerCase();
      filtered = filtered.filter(job => {
        // Säker åtkomst till egenskaper med null-check
        const title = job.title || '';
        const description = job.description || '';
        const employer = job.employer || '';
        const municipality = job.workplace?.municipality || '';

        return (
          title.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          employer.toLowerCase().includes(searchLower) ||
          municipality.toLowerCase().includes(searchLower)
        );
      });
    }

    if (activeFilters.employmentType.length > 0) {
      filtered = filtered.filter(job => 
        activeFilters.employmentType.includes(job.employment_type)
      );
    }

    if (activeFilters.location.length > 0) {
      filtered = filtered.filter(job => 
        job.workplace && activeFilters.location.includes(job.workplace.municipality)
      );
    }

    if (activeFilters.experience.length > 0) {
      filtered = filtered.filter(job => {
        const experienceStatus = job.requiresExperience ? 'Erfarenhet krävs' : 'Ingen erfarenhet krävs';
        return activeFilters.experience.includes(experienceStatus);
      });
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobsArray, activeFilters, tableSearchTerm]);

  const toggleFilter = (type: 'employmentType' | 'location' | 'experience', value: string) => {
    setActiveFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return {
        ...prev,
        [type]: updated
      };
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      employmentType: [],
      location: [],
      experience: []
    });
    setTableSearchTerm('');
  };

  const totalActiveFilters = activeFilters.employmentType.length + activeFilters.location.length + activeFilters.experience.length;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Preload images for next page
  useEffect(() => {
    const nextPageJobs = filteredJobs.slice(indexOfLastJob, indexOfLastJob + jobsPerPage);
    nextPageJobs.forEach(job => {
      if (job.logotype) {
        const img = new Image();
        img.src = job.logotype;
      }
    });
  }, [currentPage, filteredJobs, indexOfLastJob, jobsPerPage]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <SearchBar 
            initialKeyword={searchKeyword}
            initialLocation={initialLocation}
            onSearch={(keyword, location) => {
              setSearchKeyword(keyword);
              setActiveFilters(prev => ({
                ...prev,
                location: location ? [location] : []
              }));
              if (onSearch) {
                onSearch(keyword, location);
              }
            }}
            isAiMode={isAiMode}
            onAiModeToggle={onAiModeToggle}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Antal jobb hittade */}
      {searchKeyword && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            <span className="text-blue-600">{filteredJobs.length}</span>
            <span className="text-gray-700"> jobb hittade</span>
            {searchKeyword && (
              <span className="text-gray-500">
                {" "}för <span className="text-blue-500 font-medium">&quot;{searchKeyword}&quot;</span>
              </span>
            )}
          </h2>
        </div>
      )}

      {showFilters && (
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Filtrera jobb</h3>

            {/* Search input */}
            <div>
              <input
                type="text"
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                placeholder="Sök efter jobb, företag eller plats..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Employment Type */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                Anställningstyp
              </h4>
              <div className="space-y-2">
                {uniqueFilters.employmentType.map(type => {
                  const count = jobsArray.filter(job => job.employment_type === type).length;
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.employmentType.includes(type)}
                        onChange={() => toggleFilter('employmentType', type)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-offset-0 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 flex-1">
                        {type}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                Erfarenhet
              </h4>
              <div className="space-y-2">
                {uniqueFilters.experience.map(exp => {
                  const count = jobsArray.filter(job => 
                    (job.requiresExperience ? 'Erfarenhet krävs' : 'Ingen erfarenhet krävs') === exp
                  ).length;
                  return (
                    <label key={exp} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.experience.includes(exp)}
                        onChange={() => toggleFilter('experience', exp)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-offset-0 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 flex-1">
                        {exp}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Plats
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {uniqueFilters.location.map(location => {
                  const count = jobsArray.filter(job => job.workplace?.municipality === location).length;
                  return (
                    <label key={location} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.location.includes(location)}
                        onChange={() => toggleFilter('location', location)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-offset-0 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 flex-1">
                        {location}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Clear filters button */}
            {totalActiveFilters > 0 && (
              <div className="pt-2">
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1.5 border border-blue-100 rounded-xl hover:bg-blue-50/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Rensa filter ({totalActiveFilters})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {currentJobs.map((job, index) => (
          <JobCard
            key={index}
            job={job}
            onCreateCV={onCreateCV}
            onCreateCoverLetter={onCreateCoverLetter}
            searchKeyword={searchKeyword}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {currentJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inga jobb hittades
          </h3>
          <p className="text-gray-600 text-center mt-4">
            Inga jobb hittades. Prova att söka med andra sökord eller filtrera annorlunda.
          </p>
        </div>
      )}
    </div>
  );
}
