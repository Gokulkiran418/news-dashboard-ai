import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import ErrorMessage from '../components/ErrorMessage';
import { Article } from '../types/article';
import { PacmanLoader } from 'react-spinners';
import { getBaseUrl } from '../lib/getBaseUrl';

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

  useEffect(() => {
    setIsLoading(false);
    const handleRouteChangeComplete = () => setIsSearching(false);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router.events]);

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
      setIsSearching(false);
    }
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
      setIsSearching(false);
    }
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
      <Navbar />
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={loaderVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[80px]"
      >
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
              <PacmanLoader color="#36d7b7" size={30} />
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
                  <ArticleCard article={article} query={query} setIsSearching={setIsSearching} />
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
  const baseUrl = getBaseUrl(context.req); // ✅ Uses correct base URL for Vercel

  try {
    const res = await fetch(
      `${baseUrl}/api/news${query ? `?query=${encodeURIComponent(query as string)}` : ''}${
        page ? `${query ? '&' : '?'}page=${encodeURIComponent(page as string)}` : ''
      }`
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
