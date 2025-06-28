import { GetServerSideProps } from 'next';
import Link from 'next/link';
import OpenAI from 'openai';
import readingTime from 'reading-time';
import ArticleHeader from '../../components/ArticleHeader';
import ArticleDescription from '../../components/ArticleDescription';
import ArticleKeywords from '../../components/ArticleKeyword';
import ArticleLink from '../../components/ArticleLink';
import ArticleSummary from '../../components/ArticleSummary';
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

    const readingTimeStats = readingTime(article.description || '');
    const readingTimeText = readingTimeStats.text;

    let keywords: string[] = [];
    if (article.description && process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that extracts keywords from text. Return a list of 3-5 key phrases (1-3 words each) that summarize the main topics of the input text, separated by commas.',
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

export default function ArticleDetail({ article, error, readingTime, keywords }: ArticleDetailProps) {
  if (error || !article) {
    return (
      <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-900 min-h-screen w-full">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">Article Not Found</h1>
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 p-4 rounded-md mb-4">
          <p>{error || 'Failed to load article. Please try another article.'}</p>
        </div>
        <Link
          href="/"
          className="inline-block text-blue-500 dark:text-blue-300 hover:underline font-medium"
          aria-label="Return to home page"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const isShortDescription = !article.description || article.description.length < 50;

  return (
    <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-900 min-h-screen w-full">
      <Link
        href="/"
        className="inline-block text-blue-500 dark:text-blue-300 hover:underline font-medium mb-4"
        aria-label="Return to home page"
      >
        Back to Home
      </Link>
      <ArticleHeader
        title={article.title}
        image_url={article.image_url}
        source_id={article.source_id}
        pubDate={article.pubDate}
      />
      <ArticleDescription description={article.description} isShortDescription={isShortDescription} />
      <ArticleKeywords keywords={keywords} readingTime={readingTime} />
      <ArticleLink link={article.link} source_id={article.source_id} />
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">AI-Generated Summary</h2>
      <ArticleSummary description={article.description} />
    </div>
  );
}