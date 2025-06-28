import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { PacmanLoader } from 'react-spinners';
import readingTime from 'reading-time';
import OpenAI from 'openai';
import { Article } from '../../types/article';
import { SummaryResponse } from '../../types/summary';

type ArticleDetailProps = {
  article: Article | null;
  error?: string;
  readingTime: string;
  keywords: string[];
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    // Fetch article from newsdata.io
    const res = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&id=${encodeURIComponent(id)}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch article: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('Article not found');
    }
    const article = data.results[0];

    // Calculate reading time
    const readingTimeStats = readingTime(article.description || '');
    const readingTimeText = readingTimeStats.text; // e.g., "3 min read"

    // Extract keywords using OpenAI
    let keywords: string[] = [];
    if (article.description && process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts keywords from text. Return a list of 3-5 key phrases (1-3 words each) that summarize the main topics of the input text, separated by commas.',
          },
          {
            role: 'user',
            content: `Extract keywords from this text: "${article.description}"`,
          },
        ],
        max_tokens: 50,
      });
      const responseText = completion.choices[0]?.message.content || '';
      keywords = responseText.split(',').map((k) => k.trim()).slice(0, 5);
    }

    return {
      props: {
        article,
        readingTime: readingTimeText,
        keywords,
      },
    };
  } catch (error: any) {
    console.error('Error in getServerSideProps:', error.message);
    return {
      props: {
        article: null,
        error: error.message || 'Failed to load article',
      },
    };
  }
};

export default function ArticleDetail({
  article,
  error,
  readingTime,
  keywords,
}: ArticleDetailProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (article && article.description) {
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
      <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Article Not Found</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
          <p>{error || 'Failed to load article. Please try another article.'}</p>
        </div>
        <Link
          href="/"
          className="inline-block text-blue-500 hover:underline font-medium"
          aria-label="Return to home page"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const isShortDescription = !article.description || article.description.length < 50;

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen max-w-3xl">
      <Link
        href="/"
        className="inline-block text-blue-500 hover:underline font-medium mb-4"
        aria-label="Return to home page"
      >
        Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.title}</h1>
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-64 object-cover rounded-md mb-4"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md mb-4">
          <span className="text-gray-500 text-sm">No Image Available</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
        <p className="text-gray-600 text-sm">
          <span className="font-semibold">Source:</span> {article.source_id}
        </p>
        <p className="text-gray-500 text-sm">
          <span className="font-semibold">Published:</span>{' '}
          {format(parseISO(article.pubDate), 'PPP')}
        </p>
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">Description</h2>
      {isShortDescription ? (
        <p className="text-gray-500 italic mb-4">
          No detailed description available. See the AI-generated summary below or read the full article.
        </p>
      ) : (
        <p className="text-lg text-gray-700 leading-loose mb-4">{article.description}</p>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {keywords.length > 0 ? (
            keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
              >
                {keyword}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No keywords available</p>
          )}
        </div>
        <p className="text-gray-500 text-sm">Estimated reading time: {readingTime}</p>
      </div>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 mb-6 text-lg font-medium"
        aria-label={`Read full article at ${article.source_id}`}
      >
        Read Full Article
      </a>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">AI-Generated Summary</h2>
      {isLoadingSummary ? (
        <div className="flex justify-center">
          <PacmanLoader color="#36d7b7" />
        </div>
      ) : summaryError ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p>{summaryError}</p>
        </div>
      ) : (
        <p className="text-lg text-gray-700 leading-loose">{summary}</p>
      )}
    </div>
  );
}