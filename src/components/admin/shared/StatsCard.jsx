'use client';

export default function StatsCard({ icon, bgColor, title, value, description, trend, trendIcon }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className={`${bgColor} p-3 rounded-full mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <div className="flex items-center">
                    <p className="text-xl font-bold">{value}</p>
                    {trend !== undefined && trendIcon && (
                        <div className="flex items-center ml-2 text-xs">
                            {trendIcon}
                            <span className={`ml-1 ${parseFloat(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(parseFloat(trend))}%
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </div>
    );
} 