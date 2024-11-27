import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  initialKeyword?: string;
  onSearch: (keyword: string) => void;
  isAiMode?: boolean;
  onAiModeToggle?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialKeyword = '',
  onSearch,
  isAiMode,
  onAiModeToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isClosing, setIsClosing] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchBoxRect, setSearchBoxRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

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

  const handleOpen = () => {
    if (searchBoxRef.current) {
      const rect = searchBoxRef.current.getBoundingClientRect();
      setSearchBoxRect(rect);
    }
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
      setSearchBoxRect(null);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
      handleClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setKeyword(newValue);
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
        className="relative"
        style={{
          opacity: isExpanded ? 0 : 1,
          visibility: isExpanded ? 'hidden' : 'visible',
          transition: 'opacity 200ms ease-out',
        }}
      >
        <div
          onClick={handleOpen}
          className="relative w-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all duration-200 cursor-pointer group"
        >
          <input
            readOnly
            value={keyword}
            placeholder="Sök efter jobb..."
            className="w-full py-3 pl-11 pr-4 text-gray-900 bg-transparent cursor-pointer"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
          </div>
        </div>
      </div>

      {/* Expanderat sökfält */}
      <AnimatePresence>
        {(isExpanded || isClosing) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-100 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            <motion.div
              initial={{
                opacity: 0,
                top: searchBoxRect ? searchBoxRect.top : 0,
                left: searchBoxRect ? searchBoxRect.left : 0,
                width: searchBoxRect ? searchBoxRect.width : 0,
                scale: searchBoxRect ? searchBoxRect.width / (window.innerWidth < 640 ? window.innerWidth - 32 : 600) : 1,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: 1,
                top: '50%',
                left: '50%',
                width: window.innerWidth < 640 ? 'calc(100vw - 32px)' : 600,
                scale: 1,
                x: '-50%',
                y: '-50%',
              }}
              exit={{
                opacity: 0,
                top: searchBoxRect ? searchBoxRect.top : 0,
                left: searchBoxRect ? searchBoxRect.left : 0,
                width: searchBoxRect ? searchBoxRect.width : 0,
                scale: searchBoxRect ? searchBoxRect.width / (window.innerWidth < 640 ? window.innerWidth - 32 : 600) : 1,
                x: 0,
                y: 0,
              }}
              transition={isClosing ? {
                duration: 1,
                ease: [0.4, 0, 0.2, 1]
              } : {
                duration: 1,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="bg-white rounded-lg border border-gray-200 shadow-lg z-50 fixed"
            >
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col md:flex-row md:items-center gap-3 p-3">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={keyword}
                      onChange={handleInputChange}
                      placeholder="Sök efter jobb, företag eller plats..."
                      className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:flex-none">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 md:flex-none h-10 px-4 bg-blue-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                    >
                      <span className="text-[15px]">Sök</span>
                    </motion.button>
                    
                    {onAiModeToggle && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAiModeToggle}
                        className={`h-10 px-3 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                          isAiMode 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium md:hidden">AI-sökning</span>
                      </motion.button>
                    )}

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClose}
                      className="h-10 px-3 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-500 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium md:hidden">Stäng</span>
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
