import { ReactNode } from 'react';
import { CheckCircleIcon, AlertCircleIcon, ClockIcon, SparklesIcon } from '../icons';

export interface BadgeProps {
  variant: 'verified' | 'disputed' | 'pending' | 'ai';
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function Badge({ variant, children, size = 'md', animated = false }: BadgeProps) {
  const sizeMap = {
    sm: { 
      padding: 'px-2 py-1', 
      text: 'text-xs', 
      icon: 14,
    },
    md: { 
      padding: 'px-3 py-1', 
      text: 'text-sm', 
      icon: 16,
    },
    lg: { 
      padding: 'px-4 py-2', 
      text: 'text-base', 
      icon: 18,
    },
  };

  const variants = {
    verified: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircleIcon size={sizeMap[size].icon} />,
    },
    disputed: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: <AlertCircleIcon size={sizeMap[size].icon} />,
    },
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: <ClockIcon size={sizeMap[size].icon} />,
    },
    ai: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      icon: <SparklesIcon size={sizeMap[size].icon} />,
    },
  };

  const style = variants[variant];
  const sizeStyle = sizeMap[size];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-semibold border
        ${style.bg} ${style.text} ${style.border}
        ${sizeStyle.padding} ${sizeStyle.text}
        ${animated ? 'animate-verifySuccess' : ''}
        transition-all duration-200
      `}
    >
      {style.icon}
      <span>{children || variant.charAt(0).toUpperCase() + variant.slice(1)}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, BadgeProps['variant']> = {
    'Verified': 'verified',
    'Disputed': 'disputed',
    'Pending Verification': 'pending',
    'AI Verified': 'ai',
  };

  const variant = statusMap[status] || 'pending';

  return <Badge variant={variant}>{status}</Badge>;
}
