import React from 'react';

interface ArticleDescriptionProps {
  description?: string | null;
  isShortDescription: boolean;
}

const ArticleDescription: React.FC<ArticleDescriptionProps> = React.memo(
  ({ description, isShortDescription }) => {
    return (
      <>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Description</h2>
        {isShortDescription ? (
          <p className="text-gray-500 italic mb-4">
            No detailed description available. See the AI-generated summary below or read the full
            article.
          </p>
        ) : (
          <p className="text-lg text-gray-700 leading-loose mb-4">{description}</p>
        )}
      </>
    );
  }
);

export default ArticleDescription;