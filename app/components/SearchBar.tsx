import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  initialKeyword?: string;
  initialLocation?: string;
  onSearch: (keyword: string, location: string) => void;
  isAiMode?: boolean;
  onAiModeToggle?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialKeyword = '',
  initialLocation = '',
  onSearch,
  isAiMode,
  onAiModeToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [isClosing, setIsClosing] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const [searchBoxRect, setSearchBoxRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setKeyword(initialKeyword);
    setLocation(initialLocation);
  }, [initialKeyword, initialLocation]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isExpanded && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        handleClose();
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      // Spara nuvarande scroll position
      const scrollPos = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPos}px`;
      document.body.style.width = '100%';
    } else {
      // Återställ scroll position
      const scrollPos = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollPos || '0') * -1);
    }
  }, [isExpanded]);

  const handleOpen = () => {
    if (searchBoxRef.current) {
      const rect = searchBoxRef.current.getBoundingClientRect();
      setSearchBoxRect(rect);
    }
    setIsExpanded(true);
  };

  const handleClose = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
    if (locationRef.current) {
      locationRef.current.blur();
    }
    setIsClosing(true);
    
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
      
      // Återställ viewport efter en kort fördröjning
      setTimeout(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      }, 100);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      if (inputRef.current) {
        inputRef.current.blur();
      }
      if (locationRef.current) {
        locationRef.current.blur();
      }
      
      // Stäng först om expanderad
      if (isExpanded) {
        handleClose();
        
        // Anropa sökning efter en kort fördröjning
        setTimeout(() => {
          onSearch(keyword.trim(), location.trim());
        }, 300);
      } else {
        // Om inte expanderad, sök direkt
        onSearch(keyword.trim(), location.trim());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setKeyword(newValue);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocation(newValue);
  };

  const getModalStyles = () => {
    if (!searchBoxRect) return {};

    const viewportWidth = window.innerWidth;
    const modalWidth = Math.min(viewportWidth * 0.95, 600);
    const scaleStart = searchBoxRect.width / modalWidth;

    const startPosition = {
      transform: `
        translate(
          ${searchBoxRect.left}px,
          ${searchBoxRect.top}px
        )
        scale(${scaleStart})
      `,
      opacity: isClosing ? 0 : 1,
    };

    const endPosition = {
      transform: `
        translate(
          calc(50vw - ${modalWidth/2}px),
          calc(50vh - 50%)
        )
        scale(1)
      `,
      opacity: 1,
    };

    return {
      position: 'fixed' as const,
      top: '0',
      left: '0',
      width: `${modalWidth}px`,
      ...(isClosing ? startPosition : endPosition),
      transition: 'all 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    };
  };

  return (
    <div className="relative w-full">
      {/* Kompakt sökfält */}
      <div
        ref={searchBoxRef}
        className="w-full"
      >
        <form onSubmit={handleSubmit}>
          <div
            onClick={handleOpen}
            className="relative w-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={keyword}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Sök efter jobbtitel, kompetens eller företag"
                  className="w-full h-12 pl-12 pr-4 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
                </div>
              </div>
              <div className="relative flex-1">
                <input
                  readOnly
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={location}
                  placeholder="Ange stad..."
                  className="w-full py-3 pl-11 pr-4 text-gray-900 bg-transparent cursor-pointer"
                  style={{ fontSize: '16px' }}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Expanderat sökfält */}
      <AnimatePresence>
        {(isExpanded || isClosing) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-100/90 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            <motion.div
              ref={modalRef}
              style={getModalStyles()}
              className="bg-white rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="relative p-4">
                <div className="space-y-4">
                  <div className="relative flex flex-col md:flex-row gap-2 w-full">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={keyword}
                        onChange={handleInputChange}
                        placeholder="Sök efter jobb..."
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 rounded-lg transition-all text-sm"
                        style={{ fontSize: '16px' }}
                      />
                    </div>

                    {!isAiMode && (
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          ref={locationRef}
                          type="text"
                          value={location}
                          onChange={handleLocationChange}
                          placeholder="Ange stad..."
                          className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 rounded-lg transition-all text-sm"
                          style={{ fontSize: '16px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {onAiModeToggle && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onAiModeToggle}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isAiMode 
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      AI-sökning
                    </motion.button>
                  )}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="ml-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Sök
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
