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
import { Search, FileText, Zap } from 'lucide-react';
import { Job } from './types'; 
import { API_ENDPOINTS } from './config/api';
import { cn } from './lib/utils';

export default function JobSearch() {
  const [user, loading, error] = useAuthState(auth);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isCreateCoverLetterOpen, setIsCreateCoverLetterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isInitialView, setIsInitialView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const popularSearches = [
    { title: 'Sjuksköterska', icon: '👨‍⚕️' },
    { title: 'Systemutvecklare', icon: '💻' },
    { title: 'Lärare', icon: '👨‍🏫' },
    { title: 'Data Scientist', icon: '📊' },
    { title: 'Projektledare', icon: '📋' },
    { title: 'Undersköterska', icon: '🏥' }
  ];

  const aiSearchExamples = [
    // Svenska exempel
    "T.ex. 'Jag söker utvecklarjobb i Stockholm med fokus på React'",
    "T.ex. 'Jag vill jobba som sjuksköterska på deltid i Göteborg'",
    // Arabiska exempel
    "مثال: 'أبحث عن وظيفة مهندس في ستوكهولم'",
    "مثال: 'أريد العمل كممرض بدوام جزئي في يوتبوري'",
    // Somaliska exempel
    "Tusaale: 'Waxaan raadinayaa shaqo horumarinta barnaamijyada Stockholm'",
    "Tusaale: 'Waxaan rabaa inaan kalkaaliye caafimaad ka noqdo Göteborg'"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % aiSearchExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [aiSearchExamples.length]);

  // Sökfunktion
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (!searchKeyword.trim()) {
        setJobs([]);
        setIsInitialView(true);
        return;
      }

      const endpoint = isAiMode ? API_ENDPOINTS.analyze : API_ENDPOINTS.search;
      console.log('Making search request to:', endpoint);
      
      const requestBody = isAiMode 
        ? { query: searchKeyword }
        : { search_term: searchKeyword, max_jobs: 500 }; // Changed from keyword to search_term
      
      const searchResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Search error:', errorText);
        throw new Error('Något gick fel vid sökningen');
      }

      const searchResults = await searchResponse.json();
      console.log('Svar från backend:', searchResults);
      console.log('Antal jobb i svaret:', searchResults.jobs?.length || 0);
      console.log('Debug info:', searchResults.debug);
      
      // Om AI-läge, visa analysresultat innan jobben
      if (isAiMode && searchResults.analysis) {
        console.log('AI Analys:', searchResults.analysis);
      }
      
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
    setSelectedJob(job);
    // Här kan du lägga till logik för att öppna CV dialog
    console.log('Creating CV for job:', job.title);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-slate-50 to-blue-50")}>
      <Header 
        onLoginClick={() => setIsLoginOpen(true)} 
        onLogoClick={resetToInitialView}
        onLogout={handleLogout}
        onProfileClick={() => setIsProfileOpen(true)}
        user={user || null}
      />

      <main className={cn("pt-24 relative overflow-hidden")}>
        <div className={cn("max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative")}>
          {isInitialView && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn("flex flex-col items-center justify-center")}
            >
              <div className={cn("text-center mb-12 max-w-2xl mx-auto")}>
                <motion.h1 
                  className={cn("text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight text-gray-800")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <motion.span 
                    className={cn("bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text block mb-2")}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                  >
                    Smidigt. Smart. Smidra.
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  >
                    Skapa CV som öppnar dörrar
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className={cn("text-base sm:text-lg text-gray-600 mb-6 leading-relaxed")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                >
                  Hitta de bästa jobben som matchar din profil
                </motion.p>
              </div>

              <motion.div 
                className={cn("w-full max-w-2xl mx-auto mb-16")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              >
                <div className={cn("bg-white/95 rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow")}>
                  <div className={cn("flex justify-end p-2 sm:p-3")}>
                    <button
                      type="button"
                      onClick={() => setIsAiMode(!isAiMode)}
                      className={cn("flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all", {
                        "bg-blue-100 text-blue-600": isAiMode,
                        "bg-gray-100 text-gray-600": !isAiMode
                      })}
                    >
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="whitespace-nowrap">AI-sökning</span>
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log('Form submitted on start page');
                    const input = searchInputRef.current?.value || '';
                    console.log('Search input from start page:', input);
                    if (input.trim()) {
                      console.log('Setting searchKeyword:', input);
                      setSearchKeyword(input);
                      handleSearch();  
                    }
                  }} className={cn("flex flex-col gap-2 sm:gap-3 p-2 sm:p-3")}>
                    <div className={cn("flex items-center w-full relative bg-gray-50/50 rounded-lg")}>
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2.5 sm:left-3" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder={isAiMode 
                          ? aiSearchExamples[currentPlaceholder]
                          : "Sök efter roll eller kompetens"}
                        className={cn("w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-0 bg-transparent transition-all duration-500 rounded-lg")}
                        disabled={isLoading}
                      />
                    </div>
                    <button 
                      type="submit"
                      className={cn("w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm whitespace-nowrap hover:opacity-95 transition-opacity")}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Söker...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                          Sök jobb
                        </>
                      )}
                    </button>
                  </form>

                  {/* Popular searches */}
                  <div className="mt-8">
                    <h3 className="text-sm text-gray-500 mb-4 text-center">Populära sökningar</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {popularSearches.map((search) => (
                        <button
                          key={search.title}
                          onClick={() => {
                            setSearchKeyword(search.title);
                            handleSearch();
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                        >
                          <span>{search.icon}</span>
                          <span>{search.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Lägg till RecommendedJobs här */}
              <div className={cn("mt-8")}>
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
              className={cn("fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50")}
            >
              <div className={cn("relative flex flex-col items-center p-8 rounded-2xl bg-white shadow-2xl")}>
                <div className={cn("relative")}>
                  <div className={cn("w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin")}></div>
                  <div className={cn("absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-r-blue-600 animate-[spin_1.5s_linear_infinite]")}></div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn("mt-6 text-lg font-medium text-gray-700")}
                >
                  Söker efter jobb...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className={cn("mt-2 text-sm text-gray-500")}
                >
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
                className={cn("w-full")}
              >
                <JobList 
                  jobs={jobs} 
                  onCreateCV={handleCreateCV}
                  onCreateCoverLetter={handleCreateCoverLetter}
                  initialKeyword={searchKeyword}
                  onSearch={(keyword) => {
                    console.log('Search from JobList:', keyword);
                    setSearchKeyword(keyword);
                    handleSearch();
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
