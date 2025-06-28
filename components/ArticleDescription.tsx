import React from 'react';
import { motion } from 'framer-motion';

interface ArticleDescriptionProps {
  description?: string | null;
  isShortDescription: boolean;
}

const ArticleDescription: React.FC<ArticleDescriptionProps> = React.memo(
  ({ description, isShortDescription }) => {
    return (
      <div className="w-full">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4"
        >
          Description(From newsdata.io)
        </motion.h2>
        {isShortDescription ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 italic text-base sm:text-lg mb-4"
          >
            No detailed description available. See the AI-generated summary below or read the full article.
          </motion.p>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed mb-4"
          >
            {description}
          </motion.p>
        )}
      </div>
    );
  }
);

export default ArticleDescription;