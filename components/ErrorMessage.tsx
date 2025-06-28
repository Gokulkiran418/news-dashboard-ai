import React from 'react';

interface ErrorMessageProps {
  message: string;
  variant: 'error' | 'info';
  details?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = React.memo(({ message, variant, details }) => {
  const bgColor = variant === 'error' ? 'bg-red-100 border-red-500' : 'bg-blue-100 border-blue-500';
  const textColor = variant === 'error' ? 'text-red-700' : 'text-blue-700';

  return (
    <div className={`border-l-4 p-4 rounded-md ${bgColor} ${textColor} mb-4`}>
      <p>{message}</p>
      {details && <p className="text-sm mt-2">{details}</p>}
    </div>
  );
});

export default ErrorMessage;