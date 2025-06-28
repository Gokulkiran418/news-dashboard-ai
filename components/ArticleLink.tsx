import React from 'react';

interface ArticleLinkProps {
  link: string;
  source_id: string;
}

const ArticleLink: React.FC<ArticleLinkProps> = React.memo(({ link, source_id }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100 px-6 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 mb-6 text-lg font-medium w-full sm:w-auto"
      aria-label={`Read full article at ${source_id}`}
    >
      Read Full Article
    </a>
  );
});

export default ArticleLink;