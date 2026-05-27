import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import AIChatBot from './AIChatBot';
import { useTheme } from '../context/ThemeContext';
import { Menu, Moon, Sun } from 'lucide-react';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme, mounted } = useTheme();

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="app-header shrink-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden btn-icon"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-[1480px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AIChatBot />
    </div>
  );
};

export default Layout;
