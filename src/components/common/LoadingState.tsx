import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading live market data...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-14 h-14 mb-4">
        <div className="w-14 h-14 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
      </div>
      <p className="text-base font-semibold text-stone-700">{message}</p>
    </div>
  );
};
