// pages/index.tsx

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import ErrorMessage from '../components/ErrorMessage';
import { Article } from '../types/article';
import { PacmanLoader } from 'react-spinners';
import { getBaseUrl } from '../lib/getBaseUrl';

interface HomeProps {
  articles: Article[];
  error?: string;
  errorDetails?: string;
  query?: string;
  nextPage?: string;
}

export default function Home({
  articles = [],
  error,
  errorDetails,
  query = '',
  nextPage,
}: HomeProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(query);
  const [isLoading, setIsLoading] = useState(true);

  // ⛳️ Deduplicate articles
  const uniqueArticles = useMemo(() => {
    const seen = new Set<string>();
    return (articles ?? []).filter((a) => {
      const key = a.article_id || a.link;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [articles]);

  // ✅ End loading when articles are present
  useEffect(() => {
    if (articles.length > 0 || error) {
      setIsLoading(false);
    }
  }, [articles, error]);

  // ✅ Show loading on route changes
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setTimeout(() => setIsLoading(false), 400);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router.events]);

  const handleSearch = async () => {
    const trimmed = searchTerm.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      alert('Search term must be at least 2 characters long');
      return;
    }
    setIsLoading(true);
    await router.push(trimmed ? `/?query=${encodeURIComponent(trimmed)}` : `/`);
  };

  const handleNextPage = async () => {
    if (!nextPage) return;
    setIsLoading(true);
    await router.push(
      query
        ? `/?query=${encodeURIComponent(query)}&page=${encodeURIComponent(nextPage)}`
        : `/?page=${encodeURIComponent(nextPage)}`
    );
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
        <div className="flex flex-col items-center gap-4 mb-8">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearchSubmit={handleSearch}
            isSearching={isLoading}
          />
          {nextPage && (
            <motion.button
              onClick={handleNextPage}
              className="px-6 py-2 bg-blue-600 text-white dark:bg-blue-500 rounded-full text-sm hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Page
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loader"
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex justify-center items-center h-64"
            >
              <PacmanLoader size={30} color="#36d7b7" />
            </motion.div>
          )}

          {!isLoading && error && (
            <motion.div key="error" initial="hidden" animate="visible" exit="exit">
              <ErrorMessage message={error} details={errorDetails} variant="error" />
            </motion.div>
          )}

          {!isLoading && !error && uniqueArticles.length > 0 && (
            <motion.div
              key="articles"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {uniqueArticles.map((article, idx) => (
                <motion.div
                  key={article.article_id || article.link}
                  custom={idx}
                  variants={cardVariants}
                >
                  <ArticleCard
                    article={article}
                    query={query}
                    setIsSearching={() => setIsLoading(true)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && !error && uniqueArticles.length === 0 && (
            <motion.div key="no-articles" initial="hidden" animate="visible" exit="exit">
              <ErrorMessage
                message="No articles found. Try a different search term."
                variant="info"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { query, page } = context.query;
  const baseUrl = getBaseUrl(context.req);
  const qs = [query ? `query=${encodeURIComponent(query as string)}` : null,
              page ? `page=${encodeURIComponent(page as string)}` : null]
             .filter(Boolean)
             .join('&');
  const url = `${baseUrl}/api/news${qs ? `?${qs}` : ''}`;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || `Status ${r.status}`);
    }
    const data = await r.json();
    return {
      props: {
        articles: data.results,
        query: query || '',
        nextPage: data.nextPage ?? null,
        error: null,
        errorDetails: null,
      },
    };
  } catch (err: any) {
    return {
      props: {
        articles: null,
        query: query || '',
        nextPage: null,
        error: err.message,
        errorDetails: 'Unable to fetch articles.',
      },
    };
  }
};
