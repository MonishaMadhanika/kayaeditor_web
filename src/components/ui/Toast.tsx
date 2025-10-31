import React, { createContext, useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  notify: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ notify: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const notify = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type, duration }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[220px] max-w-xs px-4 py-3 rounded-md shadow-lg flex items-start gap-3 text-sm text-white transition transform duration-300 ease-out animate-[toast_300ms_ease-out] ${
              t.type === 'success'
                ? 'bg-green-600'
                : t.type === 'error'
                ? 'bg-red-600'
                : 'bg-ocean-700'
            }`}
          >
            <div className="flex-1">{t.message}</div>
            <button onClick={() => remove(t.id)} className="opacity-80 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// simple keyframes via CSS injection (works with Tailwind JIT too)
const style = document.createElement('style');
style.innerHTML = `@keyframes toast{from{opacity:.0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`;
if (typeof document !== 'undefined' && !document.getElementById('toast-anim')) {
  style.id = 'toast-anim';
  document.head.appendChild(style);
}


