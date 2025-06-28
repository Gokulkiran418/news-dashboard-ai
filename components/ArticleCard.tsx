import React from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Article } from '../types/article';

interface ArticleCardProps {
  article: Article;
  query?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, query }) => {
  const isBestMatch =
    query &&
    (article.title.toLowerCase().includes(query.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(query.toLowerCase())));

  return (
    <Link href={`/article/${article.article_id}`} aria-label={`Read more about ${article.title}`}>
      <div
        className={`border rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 p-4 ${
          isBestMatch ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
        }`}
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-48 object-cover rounded-md mb-4"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md mb-4">
            <span className="text-gray-500 dark:text-gray-300 text-sm">No Image Available</span>
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">{article.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{article.source_id}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{format(parseISO(article.pubDate), 'PPP')}</p>
        {isBestMatch && (
          <p className="text-blue-600 dark:text-blue-300 text-sm font-medium mt-2">Best Match</p>
        )}
      </div>
    </Link>
  );
});

export default ArticleCard;