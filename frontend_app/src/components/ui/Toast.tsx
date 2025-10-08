"use client";

import { useEffect, useState } from 'react';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from '../icons';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-green-800 dark:text-green-200',
      icon: <CheckCircleIcon size={20} className="text-green-600 dark:text-green-400" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-500 dark:border-red-600',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertCircleIcon size={20} className="text-red-600 dark:text-red-400" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-500 dark:border-blue-600',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <InfoIcon size={20} className="text-blue-600 dark:text-blue-400" />,
    },
  };

  const style = styles[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg
        transition-all duration-300
        ${style.bg} ${style.border} ${style.text}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ 
        minWidth: '300px',
        maxWidth: '500px',
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {style.icon}
      </div>
      <p className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <XIcon size={18} />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Toast Hook for easy usage
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, duration?: number) => {
    const id = Date.now().toString();
    const toast: ToastProps = {
      id,
      type,
      message,
      duration,
      onClose: removeToast,
    };
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showSuccess: (message: string, duration?: number) => showToast('success', message, duration),
    showError: (message: string, duration?: number) => showToast('error', message, duration),
    showInfo: (message: string, duration?: number) => showToast('info', message, duration),
    removeToast,
  };
}
