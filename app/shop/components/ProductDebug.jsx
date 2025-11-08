"use client";

export default function ProductDebug({ products, isLoading, error }) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Products Count: {products?.length || 0}</p>
        {products?.length > 0 && (
          <div>
            <p>Sample Product:</p>
            <pre className="text-xs bg-yellow-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(products[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}