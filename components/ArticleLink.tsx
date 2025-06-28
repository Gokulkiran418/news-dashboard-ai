import React from 'react';
import { motion } from 'framer-motion';

interface ArticleLinkProps {
  link: string;
  source_id: string;
}

const ArticleLink: React.FC<ArticleLinkProps> = React.memo(({ link, source_id }) => {
  return (
    <motion.a
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100 px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 mb-6 text-base sm:text-lg font-semibold w-full sm:w-auto text-center"
      aria-label={`Read full article at ${source_id}`}
    >
      Read Full Article
    </motion.a>
  );
});

export default ArticleLink;