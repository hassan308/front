import { useState } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, UserCircle2 } from 'lucide-react';

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
    <nav className="fixed w-full z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={onLogoClick}
          >
            <Zap className="w-6 h-6 text-blue-600 mr-1.5" />
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Smidra
            </span>
          </div>
          
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {!user && (
                <>
                  <button 
                    onClick={onLoginClick}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Kom igång
                  </button>
                  <button 
                    onClick={onLoginClick}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Logga in
                  </button>
                </>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-medium">
                  Välkommen, {user.displayName?.split(' ')[0]}!
                </span>
                <button 
                  onClick={onProfileClick}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <UserCircle2 className="w-5 h-5" />
                  Min Profil
                </button>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Logga ut
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Profile Section */}
            {user ? (
              <>
                <button 
                  onClick={onProfileClick}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <UserCircle2 className="w-6 h-6 text-gray-600" />
                </button>
                <span className="md:hidden text-sm text-gray-500">
                  Välkommen, <span className="font-medium text-gray-700">{user.displayName?.split(' ')[0]}</span>
                </span>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="md:hidden px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Logga in
                </button>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-4 top-[4.5rem] w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="px-5 py-4 bg-gradient-to-br from-blue-500/5 via-blue-500/[0.02] to-transparent">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-medium shadow-sm">
                      {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {user?.displayName || 'User'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={onProfileClick}
                  className="w-full px-3 py-2.5 text-left hover:bg-blue-50 rounded-xl transition-all flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 group-hover:text-blue-600">Min Profil</div>
                    <div className="text-xs text-gray-500">Hantera din profil</div>
                  </div>
                </button>
                
                <button
                  onClick={onLogout}
                  className="w-full mt-1 px-3 py-2.5 text-left hover:bg-red-50 rounded-xl transition-all flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 group-hover:text-red-600">Logga ut</div>
                    <div className="text-xs text-gray-500">Avsluta din session</div>
                  </div>
                </button>
              </div>

              <div className="mt-2 px-4 py-3 bg-gradient-to-br from-gray-50 via-gray-50/50 to-transparent border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                  <span className="text-xs text-gray-400">Smidra</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}