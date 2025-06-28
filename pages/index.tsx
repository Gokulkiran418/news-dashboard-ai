import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import ErrorMessage from '../components/ErrorMessage';
import { Article } from '../types/article';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

interface HomeProps {
  articles: Article[] | null;
  error?: string;
  errorDetails?: string;
  query?: string;
  nextPage?: string;
}

export default function Home({ articles, error, errorDetails, query, nextPage }: HomeProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    setIsLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2 && searchTerm.trim()) {
      alert('Search term must be at least 2 characters long');
      return;
    }
    setIsSearching(true);
    try {
      if (searchTerm.trim()) {
        await router.push(`/?query=${encodeURIComponent(searchTerm)}`);
      } else {
        await router.push('/');
      }
    } catch (err) {
      console.error('Search error:', err);
    }
    setIsSearching(false);
  };

  const handleNextPage = async () => {
    if (!nextPage) return;
    setIsSearching(true);
    try {
      const url = query
        ? `/?query=${encodeURIComponent(query)}&page=${encodeURIComponent(nextPage)}`
        : `/?page=${encodeURIComponent(nextPage)}`;
      await router.push(url);
    } catch (err) {
      console.error('Next page error:', err);
    }
    setIsSearching(false);
  };

  const loaderVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={loaderVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">News from around the world, Click an article to view summary.</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>
        </div>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
          isSearching={isSearching}
        />
        <AnimatePresence mode="wait">
          {isLoading || isSearching ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorMessage message={error} variant="error" details={errorDetails} />
            </motion.div>
          ) : articles && articles.length > 0 ? (
            <motion.div
              key="articles"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((article, index) => (
                <motion.div key={article.article_id} custom={index} variants={cardVariants}>
                  <ArticleCard article={article} query={query} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-articles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorMessage message="No articles found. Try a different search term." variant="info" />
            </motion.div>
          )}
        </AnimatePresence>
        {nextPage && (
          <motion.button
            onClick={handleNextPage}
            className="mt-8 px-6 py-3 bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next Page
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query, page } = context.query;
  try {
    const res = await fetch(
      query
        ? `http://localhost:3000/api/news?query=${encodeURIComponent(query as string)}${page ? `&page=${encodeURIComponent(page as string)}` : ''}`
        : `http://localhost:3000/api/news${page ? `?page=${encodeURIComponent(page as string)}` : ''}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch articles: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.results) {
      throw new Error('No results returned from API');
    }
    return {
      props: {
        articles: data.results,
        query: query || '',
        nextPage: data.nextPage || null,
        error: null,
        errorDetails: null,
      },
    };
  } catch (err: any) {
    console.error('Error in getServerSideProps:', err.message);
    return {
      props: {
        articles: null,
        error: err.message || 'Something went wrong',
        errorDetails: err.message.includes('Invalid query') || err.message.includes('API key')
          ? err.message
          : 'Failed to fetch articles. Please try again later.',
        query: query || '',
        nextPage: null,
      },
    };
  }
};