// page.tsx

'use client'

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import Header from './components/Header';
import JobList from './components/JobList';
import CoverLetterDialog from './components/CoverLetterDialog';
import LoginDialog from './components/LoginDialog';
import RegisterDialog from './components/RegisterDialog';
import ProfileDialog from './components/ProfileDialog';
import RecommendedJobs from './components/RecommendedJobs'; 
import { Search, FileText, Zap, MapPin, Briefcase, GraduationCap, Code, Stethoscope, ClipboardList, Users, Building2, Wrench } from 'lucide-react';
import { Job } from './types'; 
import { API_ENDPOINTS } from './config/api';
import { cn } from './lib/utils';

export default function JobSearch() {
  // Constants
  const popularSearches = [
    { icon: Stethoscope, label: 'Sjuksköterska' },
    { icon: Code, label: 'Systemutvecklare' },
    { icon: GraduationCap, label: 'Lärare' },
    { icon: Briefcase, label: 'Data Scientist' },
    { icon: ClipboardList, label: 'Projektledare' },
    { icon: Users, label: 'Undersköterska' },
    { icon: Building2, label: 'Fastighet' },
    { icon: Wrench, label: 'Tekniker' }
  ];

  const aiSearchExamples = [
    "T.ex. 'Jag söker utvecklarjobb i Stockholm med fokus på React'",
    "T.ex. 'Jag vill jobba som sjuksköterska på deltid i Göteborg'",
    "مثال: 'أبحث عن وظيفة مهندس في ستوكهولم'",
    "مثال: 'أريد العمل كممرض بدوام جزئي في يوتبوري'",
    "Tusaale: 'Waxaan raadinayaa shaqo horumarinta barnaamijyada Stockholm'",
    "Tusaale: 'Waxaan rabaa inaan kalkaaliye caafimaad ka noqdo Göteborg'"
  ];

  // Auth state
  const [user, loading, error] = useAuthState(auth);
  
  // UI state
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isCreateCoverLetterOpen, setIsCreateCoverLetterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isInitialView, setIsInitialView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % aiSearchExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [aiSearchExamples.length]);

  // Wait for auth and mounting
  if (!mounted || loading) {
    return null;
  }

  // Constants
  const handleSearch = async (keyword?: string, location?: string) => {
    setIsLoading(true);
    const searchTerm = keyword || searchKeyword;
    
    try {
      if (!searchTerm.trim() && !location?.trim()) {
        setJobs([]);
        setIsInitialView(true);
        return;
      }

      let searchResults;
      
      if (isAiMode) {
        // Om AI-läge, analysera först med AI
        console.log('Making AI analysis request');
        const analyzeResponse = await fetch(API_ENDPOINTS.analyze, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchTerm }),
        });

        if (!analyzeResponse.ok) {
          const errorText = await analyzeResponse.text();
          console.error('AI analysis error:', errorText);
          throw new Error('Kunde inte analysera sökfrågan');
        }

        searchResults = await analyzeResponse.json();
        console.log('AI Analys:', searchResults.analysis);
      } else {
        // Om inte AI-läge, sök direkt med /search
        console.log('Making direct search request');
        const searchResponse = await fetch(API_ENDPOINTS.search, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            search_term: searchTerm,
            municipality: location || '',
            max_jobs: 500
          }),
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error('Search error:', errorText);
          throw new Error('Kunde inte hämta jobb');
        }

        searchResults = await searchResponse.json();
      }

      console.log('Svar från backend:', searchResults);
      console.log('Antal jobb i svaret:', searchResults.jobs?.length || 0);
      console.log('Debug info:', searchResults.debug);
      
      const jobsList = searchResults.jobs || [];
      setJobs(jobsList);
      setIsInitialView(jobsList.length === 0);
    } catch (error) {
      console.error('Ett fel inträffade:', error);
      setJobs([]);
      setIsInitialView(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToInitialView = () => {
    setIsInitialView(true);
    setJobs([]);
    setSearchKeyword('');
    setLocation('');
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error('Logout error:', error);
    });
  };

  const handleCreateCoverLetter = (job: Job) => {
    setSelectedJob(job);
    setIsCreateCoverLetterOpen(true);
  };

  const handleCreateCV = (job: Job) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedJob(job);
    // Här kan du lägga till logik för att öppna CV dialog
    console.log('Creating CV for job:', job.title);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-slate-50 to-blue-50")}>
      <Header 
        user={user ?? null}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoClick={resetToInitialView}
        onLogout={handleLogout}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <main className="pt-24 relative overflow-hidden bg-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isInitialView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-5xl md:text-6xl font-bold"
                >
                  <span className="text-[#4169E1]">Smidigt.</span>{' '}
                  <span className="text-[#9333EA]">Smart.</span>{' '}
                  <span className="text-[#4169E1]">Smidra.</span>
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="block mt-6 text-3xl md:text-4xl text-gray-800"
                >
                  Skapa CV som öppnar dörrar
                </motion.span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-lg md:text-xl text-gray-600 mt-4"
              >
                Hitta de bästa jobben som matchar din profil
              </motion.p>

              <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-white/95 rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }} className="p-3 sm:p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder={isAiMode 
                                ? aiSearchExamples[currentPlaceholder]
                                : "Sök efter roll eller kompetens"}
                              className="w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 rounded-lg transition-all text-base"
                              disabled={isLoading}
                            />
                          </div>

                          {!isAiMode && (
                            <div className="relative flex-1">
                              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Plats"
                                className="w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 rounded-lg transition-all text-base"
                                disabled={isLoading}
                              />
                            </div>
                          )}

                          <div className="hidden sm:flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAiMode(!isAiMode);
                                if (!isAiMode) {
                                  setLocation('');
                                }
                              }}
                              className={cn("flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-sm font-medium transition-all h-full", {
                                "bg-blue-100 text-blue-600": isAiMode,
                                "bg-gray-100 text-gray-600 hover:bg-gray-200": !isAiMode
                              })}
                            >
                              <Zap className="w-4 h-4" />
                              <span>AI-sökning</span>
                            </button>
                            
                            <button 
                              type="submit"
                              onClick={handleSearch}
                              disabled={isLoading}
                              className={cn(
                                "px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg",
                                "hover:from-blue-700 hover:to-blue-800 transition-all duration-200",
                                "font-medium text-base shadow-md hover:shadow-lg",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "flex items-center justify-center gap-2"
                              )}
                            >
                              {isLoading ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Söker...</span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-5 h-5" />
                                  <span>Sök jobb</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:hidden gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAiMode(!isAiMode);
                              if (!isAiMode) {
                                setLocation('');
                              }
                            }}
                            className={cn("w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-sm font-medium transition-all", {
                              "bg-blue-100 text-blue-600": isAiMode,
                              "bg-gray-100 text-gray-600 hover:bg-gray-200": !isAiMode
                            })}
                          >
                            <Zap className="w-4 h-4" />
                            <span>AI-sökning</span>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={handleSearch}
                            disabled={isLoading}
                            className={cn(
                              "w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg",
                              "hover:from-blue-700 hover:to-blue-800 transition-all duration-200",
                              "font-medium text-base shadow-md hover:shadow-lg",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "flex items-center justify-center gap-2"
                            )}
                          >
                            {isLoading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Söker...</span>
                              </>
                            ) : (
                              <>
                                <Search className="w-5 h-5" />
                                <span>Sök jobb</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {!isAiMode && (
                    <div className="px-3 sm:px-4 pb-4">
                      <p className="text-sm text-gray-600 mb-3 text-center">Populära sökningar</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {popularSearches.map(({ icon: Icon, label }) => (
                          <button
                            key={label}
                            onClick={() => {
                              setSearchKeyword(label);
                              handleSearch(label);
                            }}
                            className="group relative flex items-center space-x-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                          >
                            <Icon className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">{label}</span>
                            
                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rekommenderade jobb */}
              <div className="mt-16">
                <RecommendedJobs 
                  onCreateCoverLetter={handleCreateCoverLetter}
                  onCreateCV={handleCreateCV}
                />
              </div>
            </motion.div>
          )}

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn("fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50")}>
              <div className={cn("relative flex flex-col items-center p-8 rounded-2xl bg-white shadow-2xl")}>
                <div className={cn("relative")}>
                  <div className={cn("w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin")}></div>
                  <div className={cn("absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-r-blue-600 animate-[spin_1.5s_linear_infinite]")}></div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn("mt-6 text-lg font-medium text-gray-700")}>
                  {isAiMode ? (
                    <>{searchKeyword}</>
                  ) : location ? (
                    <>Söker jobb som <span className="text-blue-600">{searchKeyword}</span> i <span className="text-blue-600">{location}</span></>
                  ) : (
                    <>Söker jobb som <span className="text-blue-600">{searchKeyword}</span></>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className={cn("mt-2 text-sm text-gray-500")}>
                  Detta kan ta några sekunder
                </motion.div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isInitialView && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("w-full")}>
                <JobList 
                  jobs={jobs} 
                  onCreateCV={handleCreateCV}
                  onCreateCoverLetter={handleCreateCoverLetter}
                  initialKeyword={searchKeyword}
                  initialLocation={location}
                  onSearch={(keyword, location) => {
                    setSearchKeyword(keyword);
                    setLocation(location);
                    handleSearch(keyword, location);
                  }}
                  isAiMode={isAiMode}
                  onAiModeToggle={() => setIsAiMode(!isAiMode)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <CoverLetterDialog 
        isOpen={isCreateCoverLetterOpen} 
        onClose={() => setIsCreateCoverLetterOpen(false)} 
        onSubmit={(coverLetterData: any) => {
          setIsCreateCoverLetterOpen(false)
        }} 
      />
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterDialog isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ProfileDialog isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}