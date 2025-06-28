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
      <>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h1>
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-auto sm:h-96 object-cover rounded-md mb-4"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="w-full h-64 sm:h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md mb-4">
            <span className="text-gray-500 dark:text-gray-300 text-sm">No Image Available</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            <span className="font-semibold">Source:</span> {source_id}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            <span className="font-semibold">Published:</span> {formattedDate}
          </p>
        </div>
      </>
    );
  }
);

export default ArticleHeader;