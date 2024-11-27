import { useState } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  onLogoClick: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  user: User | null;
}

export default function Header({ onLoginClick, onLogoClick, onLogout, onProfileClick, user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={onLogoClick}
          >
            <span className="text-xl font-bold logo-text">
              Smidra
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <span className="text-gray-600 font-medium">
                Välkommen, {user.displayName?.split(' ')[0]}!
              </span>
            ) : (
              <></>
            )}
            
            {user ? (
              <button 
                onClick={onProfileClick}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Min Profil
              </button>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Logga in
              </button>
            )}
            
            {user ? (
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Logga ut
              </button>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Kom igång
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200/50 md:hidden"
            >
              <div className="p-4 space-y-3">
                {user ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Välkommen, {user.displayName?.split(' ')[0]}!
                  </div>
                ) : (
                  <></>
                )}
                
                {user ? (
                  <button
                    onClick={onProfileClick}
                    className="w-full p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-left font-medium text-sm transition-colors"
                  >
                    Min Profil
                  </button>
                ) : (
                  <button
                    onClick={onLoginClick}
                    className="w-full p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-left font-medium text-sm transition-colors"
                  >
                    Logga in
                  </button>
                )}
                
                {user ? (
                  <button
                    onClick={onLogout}
                    className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Logga ut
                  </button>
                ) : (
                  <button
                    onClick={onLoginClick}
                    className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Kom igång
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}