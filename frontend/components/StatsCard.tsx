import { ComponentType } from 'react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    accent: 'border-blue-200',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    accent: 'border-green-200',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    accent: 'border-yellow-200',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    accent: 'border-red-200',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    accent: 'border-purple-200',
  },
};

export default function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={clsx(
      'bg-white overflow-hidden shadow-smooth rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg',
      colors.accent
    )}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={clsx('p-3 rounded-md', colors.bg)}>
              <Icon className={clsx('h-6 w-6', colors.icon)} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-2xl font-bold text-gray-900">
                  {value.toLocaleString()}
                </div>
                {trend && (
                  <div className="mt-1 flex items-center text-sm">
                    <span className={clsx(
                      'font-medium',
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                    <span className="text-gray-500 ml-1">
                      {trend.label}
                    </span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 