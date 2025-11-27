import React from 'react';

/**
 * Loading Skeleton Component
 * Better UX than plain spinners
 */

export const PageSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-6 animate-pulse">
        <div className="max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="h-12 bg-gray-800 rounded-lg w-1/3 mb-8"></div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-gray-800 rounded-lg p-6 space-y-4">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-32 bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const CardSkeleton = () => (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-40 bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
);

export const ListSkeleton = ({ count = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

export const LoadingSpinner = ({ size = 'md', text = 'Đang tải...' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`animate-spin rounded-full border-b-2 border-cyan-400 ${sizeClasses[size]} mb-4`}></div>
            {text && <p className="text-white text-sm">{text}</p>}
        </div>
    );
};
