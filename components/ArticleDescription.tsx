import React from 'react';

interface ArticleDescriptionProps {
  description?: string | null;
  isShortDescription: boolean;
}

const ArticleDescription: React.FC<ArticleDescriptionProps> = React.memo(
  ({ description, isShortDescription }) => {
    return (
      <div className="w-full">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Description</h2>
        {isShortDescription ? (
          <p className="text-gray-500 dark:text-gray-400 italic text-base sm:text-lg mb-4">
            No detailed description available. See the AI-generated summary below or read the full article.
          </p>
        ) : (
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed mb-4">{description}</p>
        )}
      </div>
    );
  }
);

export default ArticleDescription;