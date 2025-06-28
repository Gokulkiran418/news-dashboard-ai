import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { PacmanLoader } from 'react-spinners';
import { Article } from '../../types/article';

type ArticleDetailProps = {
  article: Article | null;
  error?: string;
};

type SummaryResponse = {
  summary: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const res = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&id=${id}`
    );
    if (!res.ok) {
      throw new Error('Failed to fetch article');
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('Article not found');
    }
    return { props: { article: data.results[0] } };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { props: { article: null, error: 'Failed to load article' } };
  }
};

export default function ArticleDetail({ article, error }: ArticleDetailProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (article && article.description) {
      // Fetch AI-generated summary
      fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: article.description }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch summary');
          return res.json();
        })
        .then((data: SummaryResponse) => {
          setSummary(data.summary);
          setIsLoadingSummary(false);
        })
        .catch((err) => {
          console.error('Error fetching summary:', err);
          setSummaryError('Failed to load summary');
          setIsLoadingSummary(false);
        });
    } else {
      setSummaryError('No description available for summarization');
      setIsLoadingSummary(false);
    }
  }, [article]);

  if (error || !article) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-red-500">{error || 'Failed to load article'}</p>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md mb-4">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Source:</span> {article.source_id}
      </p>
      <p className="text-gray-500 mb-4">
        <span className="font-semibold">Published:</span>{' '}
        {format(parseISO(article.pubDate), 'PPP')}
      </p>
      {article.description ? (
        <p className="text-gray-700 mb-4">{article.description}</p>
      ) : (
        <p className="text-gray-500 mb-4">No description available.</p>
      )}
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Read Full Article
      </a>
      <h2 className="text-2xl font-semibold mb-2">AI-Generated Summary</h2>
      {isLoadingSummary ? (
        <div className="flex justify-center">
          <PacmanLoader color="#36d7b7" />
        </div>
      ) : summaryError ? (
        <p className="text-red-500">{summaryError}</p>
      ) : (
        <p className="text-gray-700">{summary}</p>
      )}
    </div>
  );
}