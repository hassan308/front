import { useState, useEffect, useCallback } from 'react';
import { Button } from './button';
import { Job } from '@/app/types';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterButtonProps {
  jobs: Job[];
  onFilterChange: (filteredJobs: Job[]) => void;
}

interface FilterState {
  municipalities: string[];
  employmentTypes: string[];
  experienceRequired: string[];
}

export function FilterButton({ jobs, onFilterChange }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    municipalities: [],
    employmentTypes: [],
    experienceRequired: []
  });

  // Extract unique values for each filter category
  const uniqueValues = {
    municipalities: [...new Set(jobs.map(job => job.workplace.municipality))],
    employmentTypes: [...new Set(jobs.map(job => job.employmentType))],
    experienceRequired: ['Krävs', 'Krävs ej']
  };

  // Apply filters to jobs
  const applyFilters = useCallback(() => {
    const filteredJobs = jobs.filter(job => {
      for (const [category, selectedValues] of Object.entries(filters)) {
        if (selectedValues.length === 0) continue;
        
        const jobValue = job[category as keyof Job];
        if (!jobValue) return false;
        
        if (!selectedValues.includes(jobValue)) return false;
      }
      return true;
    });
    onFilterChange(filteredJobs);
  }, [filters, jobs, onFilterChange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(v => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };

  const clearFilters = () => {
    setFilters({
      municipalities: [],
      employmentTypes: [],
      experienceRequired: []
    });
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <div className="relative">
      <Button
        variant={hasActiveFilters ? "default" : "outline"}
        size="sm"
        className={`flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 ${
          hasActiveFilters ? 'border-blue-500 text-blue-600 hover:bg-blue-50' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        Filter
        {hasActiveFilters && (
          <span className="ml-1 rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 text-xs font-medium">
            {Object.values(filters).reduce((acc, curr) => acc + curr.length, 0)}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtrera jobb</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filter sections */}
              <div className="space-y-6">
                {/* Municipalities */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <h4 className="font-medium text-gray-900">Kommun</h4>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {uniqueValues.municipalities.map(municipality => (
                      <label key={municipality} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.municipalities.includes(municipality)}
                          onChange={() => toggleFilter('municipalities', municipality)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{municipality}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Employment Types */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                    <h4 className="font-medium text-gray-900">Anställningstyp</h4>
                  </div>
                  <div className="space-y-2">
                    {uniqueValues.employmentTypes.map(type => (
                      <label key={type} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.employmentTypes.includes(type)}
                          onChange={() => toggleFilter('employmentTypes', type)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Required */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-medium text-gray-900">Erfarenhet</h4>
                  </div>
                  <div className="space-y-2">
                    {uniqueValues.experienceRequired.map(level => (
                      <label key={level} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.experienceRequired.includes(level)}
                          onChange={() => toggleFilter('experienceRequired', level)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Rensa filter
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Klar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
