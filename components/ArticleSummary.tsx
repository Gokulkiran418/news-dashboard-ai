import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PacmanLoader } from 'react-spinners';
import { SummaryResponse } from '../types/summary';

interface ArticleSummaryProps {
  description?: string | null;
}

const ArticleSummary: React.FC<ArticleSummaryProps> = ({ description }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (description) {
      fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch summary');
          return res.json();
        })
        .then((data: SummaryResponse) => {
          setSummary(data.summary);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching summary:', err);
          setError('Failed to load summary');
          setIsLoading(false);
        });
    } else {
      setError('No description available for summarization');
      setIsLoading(false);
    }
  }, [description]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center w-full py-6"
        >
          <PacmanLoader color="#36d7b7" />
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 p-4 rounded-lg w-full"
        >
          <p>{error}</p>
        </motion.div>
      ) : (
        <motion.p
          key="summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed w-full"
        >
          {summary}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default ArticleSummary;