import React from 'react';
import { USER_NAME } from '../constants';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center pb-20">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8">
        Good morning, {USER_NAME}
      </h1>
    </div>
  );
};
