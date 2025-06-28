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
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2 && searchTerm.trim()) {
      alert('Search term must be at least 2 characters long');
      return;
    }
    setIsSearching(true);
    if (searchTerm.trim()) {
      await router.push(`/?query=${encodeURIComponent(searchTerm)}`);
    } else {
      await router.push('/');
    }
    setIsSearching(false);
  };

  const handleNextPage = async () => {
    if (!nextPage) return;
    setIsSearching(true);
    const url = query
      ? `/?query=${encodeURIComponent(query)}&page=${encodeURIComponent(nextPage)}`
      : `/?page=${encodeURIComponent(nextPage)}`;
    await router.push(url);
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
        <ErrorMessage
          message={error}
          variant="error"
          details={errorDetails}
        />
      ) : articles && articles.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.article_id} article={article} query={query} />
            ))}
          </div>
          {nextPage && (
            <button
              onClick={handleNextPage}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next Page
            </button>
          )}
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
  const { query, page } = context.query;
  try {
    const res = await fetch(
      query
        ? `http://localhost:3000/api/news?query=${encodeURIComponent(query as string)}${page ? `&page=${encodeURIComponent(page as string)}` : ''}`
        : `http://localhost:3000/api/news${page ? `?page=${encodeURIComponent(page as string)}` : ''}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch articles');
    }
    const data = await res.json();
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
          : undefined,
        query: query || '',
        nextPage: null,
      },
    };
  }
};