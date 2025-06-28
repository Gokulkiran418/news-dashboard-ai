import React from 'react';
import { format, parseISO } from 'date-fns';

interface ArticleHeaderProps {
  title: string;
  image_url?: string | null;
  source_id: string;
  pubDate: string;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = React.memo(
  ({ title, image_url, source_id, pubDate }) => {
    const formattedDate = React.useMemo(() => format(parseISO(pubDate), 'PPP'), [pubDate]);

    return (
      <div className="w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h1>
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-auto max-h-96 object-cover rounded-lg mb-6"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="w-full h-64 sm:h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg mb-6">
            <span className="text-gray-500 dark:text-gray-300 text-sm">No Image Available</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-gray-600 dark:text-gray-300 text-sm mb-4">
          <p>
            <span className="font-semibold">Source:</span> {source_id}
          </p>
          <p>
            <span className="font-semibold">Published:</span> {formattedDate}
          </p>
        </div>
      </div>
    );
  }
);

export default ArticleHeader;