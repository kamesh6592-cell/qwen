import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none items-center">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-[#18181B] dark:bg-white text-white dark:text-gray-900 rounded-full shadow-xl border border-[#27272A] dark:border-gray-200"
          >
            {toast.type === 'success' && <Check size={16} className="text-green-500 dark:text-green-600" strokeWidth={2.5} />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-red-500 dark:text-red-600" strokeWidth={2.5} />}
            {toast.type === 'info' && <Info size={16} className="text-blue-500 dark:text-blue-600" strokeWidth={2.5} />}
            <span className="text-[13px] font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
