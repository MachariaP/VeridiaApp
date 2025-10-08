import { ReactNode } from 'react';
import { SearchIcon, FileTextIcon, CheckCircleIcon } from '../icons';

export interface EmptyStateProps {
  icon?: 'search' | 'content' | 'verified' | ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  const renderIcon = () => {
    if (typeof icon !== 'string') {
      return icon;
    }

    const iconMap: Record<string, ReactNode> = {
      search: <SearchIcon size={64} className="text-gray-400 dark:text-gray-600" />,
      content: <FileTextIcon size={64} className="text-gray-400 dark:text-gray-600" />,
      verified: <CheckCircleIcon size={64} className="text-gray-400 dark:text-gray-600" />,
    };

    return iconMap[icon];
  };

  return (
    <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 animate-fadeIn">
      {/* Icon with Gradient Background */}
      <div className="relative inline-block mb-6">
        <div 
          className="absolute inset-0 blur-2xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(10, 127, 255, 0.3) 0%, transparent 70%)',
          }}
        />
        <div className="relative bg-white dark:bg-gray-900 p-6 rounded-full border-2 border-gray-200 dark:border-gray-700">
          {renderIcon()}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
