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
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { props: { articles: null, error: 'Failed to load articles' } };
  }
};

export default function Home({ articles, error }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (optional, as SSR is fast)
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <PacmanLoader color="#36d7b7" />
      </div>
    );
  }

  if (error || !articles) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Latest News</h1>
        <p className="text-red-500">{error || 'Failed to load articles'}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Latest News</h1>
        <p>No articles available at this time.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Latest News</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link href={`/article/${article.article_id}`} key={article.article_id}>
            <div className="border p-4 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-2">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h2 className="text-xl font-semibold line-clamp-2">{article.title}</h2>
              <p className="text-gray-600">{article.source_id}</p>
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