// src/components/Toast.tsx
import React from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => (
  <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-xl animate-fade-in-up z-50">
    <div className="flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-300">&times;</button>
    </div>
  </div>
);

export default Toast;
