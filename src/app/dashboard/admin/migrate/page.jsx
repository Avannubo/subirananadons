'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const router = useRouter();

    const runMigration = async () => {
        setIsLoading(true);
        const toastId = toast.loading('Running stock migration...');

        try {
            const response = await fetch('/api/admin/migrate-products', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();
            setResults(data);

            if (data.success) {
                toast.success(`Migration complete: ${data.message}`, { id: toastId });
            } else {
                toast.error(`Migration failed: ${data.error}`, { id: toastId });
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Product Stock Migration</h1>
                    <p className="text-gray-600">
                        This will migrate all products to the new stock model with only 'available' and 'minStock' fields.
                        Any 'physical' or 'reserved' fields will be removed.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Back to Admin
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Migration Actions</h2>
                    <ul className="list-disc pl-5 text-gray-700">
                        <li>Transfer any 'physical' values to 'available'</li>
                        <li>Transfer any 'reserved' values to 'minStock'</li>
                        <li>Remove unnecessary fields (physical, reserved, stockHistory)</li>
                        <li>Ensure all products have valid available and minStock values</li>
                    </ul>
                </div>

                <button
                    onClick={runMigration}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded text-white ${isLoading
                        ? 'bg-amber-300 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600'}`}
                >
                    {isLoading ? 'Running Migration...' : 'Run Migration'}
                </button>
            </div>

            {results && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Migration Results</h2>

                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <div className={`w-4 h-4 rounded-full mr-2 ${results.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="font-medium">{results.success ? 'Success' : 'Failed'}</span>
                        </div>
                        <p className="text-gray-700">{results.message}</p>
                    </div>

                    {results.results && results.results.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium mb-2">Details:</h3>
                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.results.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.name || item.id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {item.error ? (
                                                        <span className="text-red-500">{item.error}</span>
                                                    ) : (
                                                        <ul className="list-disc pl-5">
                                                            {item.changes.map((change, i) => (
                                                                <li key={i}>{change}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 