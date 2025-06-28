import React from 'react';
import { motion } from 'framer-motion';

interface ArticleKeywordsProps {
  keywords: string[];
  readingTime: string;
}

const ArticleKeywords: React.FC<ArticleKeywordsProps> = React.memo(({ keywords, readingTime }) => {
  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="w-full mb-6">
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3"
      >
        Keywords & Reading Time
      </motion.h3>
      <motion.div
        className="flex flex-wrap gap-2 mb-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      >
        {keywords.length > 0 ? (
          keywords.map((keyword, index) => (
            <motion.span
              key={index}
              variants={tagVariants}
              whileHover={{ scale: 1.1 }}
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full"
            >
              {keyword}
            </motion.span>
          ))
        ) : (
          <motion.p
            variants={tagVariants}
            className="text-gray-500 dark:text-gray-400 text-sm"
          >
            No keywords available
          </motion.p>
        )}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-gray-500 dark:text-gray-400 text-sm"
      >
        Estimated reading time:{' '}
        <span className="text-blue-600 dark:text-blue-300 font-medium">{readingTime}</span>
      </motion.p>
    </div>
  );
});

export default ArticleKeywords;