import React from 'react';

interface ErrorMessageProps {
  message: string;
  variant: 'error' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, variant }) => {
  const bgColor = variant === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const borderColor = variant === 'error' ? 'border-red-500' : 'border-blue-500';
  const textColor = variant === 'error' ? 'text-red-700' : 'text-blue-700';

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} ${textColor} p-4 rounded-md`}>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;