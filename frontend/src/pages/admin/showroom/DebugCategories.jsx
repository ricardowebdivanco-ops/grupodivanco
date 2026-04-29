import React from 'react';
import { useGetCategoriesQuery } from '../../../features/categories/categoriesApi';

const DebugCategories = () => {
  const { 
    data, 
    error, 
    isLoading, 
    isSuccess, 
    isError,
    originalArgs
  } = useGetCategoriesQuery({ limit: 100 });

  console.log('🔍 Debug Categories API:', {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    originalArgs
  });

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800">Debug Categories API</h3>
      <div className="mt-2 text-sm">
        <p><strong>Loading:</strong> {isLoading ? 'true' : 'false'}</p>
        <p><strong>Success:</strong> {isSuccess ? 'true' : 'false'}</p>
        <p><strong>Error:</strong> {isError ? 'true' : 'false'}</p>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
            <strong>Error Details:</strong>
            <pre className="text-xs mt-1">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        {data && (
          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
            <strong>Data received:</strong>
            <pre className="text-xs mt-1">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugCategories;
