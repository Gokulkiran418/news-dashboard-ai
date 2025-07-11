import React from 'react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  variant: 'error' | 'info';
  details?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = React.memo(({ message, variant, details }) => {
  const bgColor = variant === 'error' ? 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-400' : 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400';
  const textColor = variant === 'error' ? 'text-red-700 dark:text-red-200' : 'text-blue-700 dark:text-blue-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`border-l-4 p-4 rounded-md ${bgColor} ${textColor} mb-4`}
    >
      <p>{message}</p>
      {details && <p className="text-sm mt-2">{details}</p>}
    </motion.div>
  );
});

export default ErrorMessage;