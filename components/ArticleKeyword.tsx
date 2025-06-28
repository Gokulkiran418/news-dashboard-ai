import React from 'react';

interface ArticleKeywordsProps {
  keywords: string[];
  readingTime: string;
}

const ArticleKeywords: React.FC<ArticleKeywordsProps> = React.memo(({ keywords, readingTime }) => {
  return (
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
      <p className="text-gray-500 text-sm">
        Estimated reading time:{' '}
        <span className="text-blue-600 font-medium">{readingTime}</span>
      </p>
    </div>
  );
});

export default ArticleKeywords;