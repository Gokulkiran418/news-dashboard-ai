import React from 'react';
import { motion } from 'framer-motion';
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

    const imageVariants = {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
    };

    return (
      <div className="w-full">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
        >
          {title}
        </motion.h1>
        {image_url ? (
          <motion.img
            src={image_url}
            alt={title}
            variants={imageVariants}
            className="w-full h-auto max-h-96 object-cover rounded-lg mb-6"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <motion.div
            variants={imageVariants}
            className="w-full h-64 sm:h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg mb-6"
          >
            <span className="text-gray-500 dark:text-gray-300 text-sm">No Image Available</span>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-gray-600 dark:text-gray-300 text-sm mb-4"
        >
          <p>
            <span className="font-semibold">Source:</span> {source_id}
          </p>
          <p>
            <span className="font-semibold">Published:</span> {formattedDate}
          </p>
        </motion.div>
      </div>
    );
  }
);

export default ArticleHeader;