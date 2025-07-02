import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { PacmanLoader } from 'react-spinners';
import { useTheme } from 'next-themes';

const Navbar: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleNavigateHome = async () => {
    setLoading(true);
    await router.push('/');
    setLoading(false);
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-[100] bg-white/60 dark:bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PacmanLoader size={30} color="#36d7b7" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className="fixed top-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-md w-full"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              News App
            </Link>

            <div className="flex items-center gap-x-4">
              <button
                onClick={handleNavigateHome}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Latest News
              </button>
              <a
                href="https://github.com/Gokulkiran418/news-dashboard-ai.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                GitHub
              </a>

              {mounted && (
                <motion.button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle theme"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {resolvedTheme === 'light' ? (
                    <MoonIcon className="w-5 h-5" />
                  ) : (
                    <SunIcon className="w-5 h-5" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
