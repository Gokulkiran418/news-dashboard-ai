import React from 'react';

interface ArticleKeywordsProps {
  keywords: string[];
  readingTime: string;
}

const ArticleKeywords: React.FC<ArticleKeywordsProps> = React.memo(({ keywords, readingTime }) => {
  return (
    <div className="w-full mb-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Keywords & Reading Time</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {keywords.length > 0 ? (
          keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No keywords available</p>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Estimated reading time:{' '}
        <span className="text-blue-600 dark:text-blue-300 font-medium">{readingTime}</span>
      </p>
    </div>
  );
});

export default ArticleKeywords;