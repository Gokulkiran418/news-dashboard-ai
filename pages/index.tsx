import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import ErrorMessage from '../components/ErrorMessage';
import { PacmanLoader } from 'react-spinners';
import { Article } from '../types/article';

interface HomeProps {
  articles: Article[] | null;
  error?: string;
  query?: string;
}

export default function Home({ articles, error, query }: HomeProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    if (searchTerm.trim()) {
      await router.push(`/?query=${encodeURIComponent(searchTerm)}`);
    } else {
      await router.push('/');
    }
    setIsSearching(false);
  };

  if (isLoading || isSearching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <PacmanLoader color="#36d7b7" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Latest News</h1>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearch}
        isSearching={isSearching}
      />
      {error ? (
        <ErrorMessage message={error} variant="error" />
      ) : articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.article_id} article={article} query={query} />
          ))}
        </div>
      ) : (
        <ErrorMessage
          message="No articles found. Try a different search term."
          variant="info"
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context.query;
  try {
    const res = await fetch(
      query
        ? `http://localhost:3000/api/news?query=${encodeURIComponent(query as string)}`
        : `http://localhost:3000/api/news`
    );
    if (!res.ok) throw new Error('Failed to fetch articles');
    const data = await res.json();
    return { props: { articles: data.results, query: query || '' } };
  } catch (err) {
    return { props: { articles: null, error: 'Something went wrong', query: query || '' } };
  }
};