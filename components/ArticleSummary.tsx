import React, { useState, useEffect } from 'react';
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

  if (isLoading) {
    return (
      <div className="flex justify-center w-full py-6">
        <PacmanLoader color="#36d7b7" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 p-4 rounded-lg w-full">
        <p>{error}</p>
      </div>
    );
  }

  return <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed w-full">{summary}</p>;
};

export default ArticleSummary;