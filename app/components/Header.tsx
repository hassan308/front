import { Menu, X, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HeaderProps {
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
}

export default function Header({
  user,
  onLoginClick,
  onLogout,
  onLogoClick,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Stäng menyn när användaren ändras (loggar in/ut)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [user]);

  const buttonClasses = {
    primary: "px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium",
    secondary: "px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors",
    icon: "flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors",
    toggle: "p-2 text-gray-500 hover:text-gray-700 transition-colors",
  };

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={onLogoClick}
          >
            <Zap className="w-6 h-6 text-blue-600 mr-1.5" />
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Smidra
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-end w-full">
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {user.displayName?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logga ut
                  </button>
                </>
              ) : (
                <button
                  onClick={onLoginClick}
                  className={buttonClasses.primary}
                >
                  Kom igång
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate max-w-[80px]">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={buttonClasses.toggle}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={buttonClasses.toggle}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 w-full bg-white shadow-lg md:hidden"
            >
              {user ? (
                <div className="divide-y divide-gray-100">
                  {/* Profile Section */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.displayName?.split(' ')[0]}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="p-4">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logga ut
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <button
                    onClick={onLoginClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                  >
                    Kom igång
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}