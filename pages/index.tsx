import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { PacmanLoader } from 'react-spinners';
import { Article } from '../types/article';

type HomeProps = {
  articles: Article[] | null;
  error?: string;
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/news');
    if (!res.ok) {
      throw new Error('Failed to fetch articles');
    }
    const data = await res.json();
    if (!Array.isArray(data.results)) {
      throw new Error('Invalid data format');
    }
    return { props: { articles: data.results } };
  } catch (error: any) {
    console.error('Error in getServerSideProps:', error.message);
    return { props: { articles: null, error: 'Failed to load articles' } };
  }
};

export default function Home({ articles, error }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <PacmanLoader color="#36d7b7" />
      </div>
    );
  }

  if (error || !articles) {
    return (
      <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Latest News</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p>{error || 'Failed to load articles. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Latest News</h1>
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
          <p>No articles available at this time. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Latest News</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            href={`/article/${article.article_id}`}
            key={article.article_id}
            aria-label={`Read more about ${article.title}`}
          >
            <div className="bg-white border rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 p-4">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-4">
                  <span className="text-gray-500 text-sm">No Image Available</span>
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-800 line-clamp-2 mb-2">
                {article.title}
              </h2>
              <p className="text-gray-600 text-sm mb-1">{article.source_id}</p>
              <p className="text-gray-500 text-sm">
                {format(parseISO(article.pubDate), 'PPP')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}