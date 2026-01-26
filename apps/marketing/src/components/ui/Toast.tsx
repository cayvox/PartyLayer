import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/design/cn';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
        <ToastPrimitive.Viewport
          className={cn(
            'fixed top-4 right-4 z-[100]',
            'flex flex-col gap-2 w-full max-w-sm',
            'outline-none'
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

const typeStyles: Record<ToastType, { bg: string; icon: string; iconBg: string }> = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: '✓',
    iconBg: 'bg-green-500 text-white',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: '✕',
    iconBg: 'bg-red-500 text-white',
  },
  info: {
    bg: 'bg-brand-50 border-brand-100',
    icon: 'i',
    iconBg: 'bg-brand-500 text-fg',
  },
};

interface ToastProps {
  toast: ToastItem;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const styles = typeStyles[toast.type];

  return (
    <ToastPrimitive.Root
      className={cn(
        'relative p-4 rounded-md border shadow-card',
        'data-[state=open]:animate-toast-in',
        'data-[state=closed]:animate-toast-out',
        styles.bg
      )}
      duration={toast.duration ?? 5000}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
            styles.iconBg
          )}
        >
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <ToastPrimitive.Title className="text-small font-medium text-fg">
            {toast.title}
          </ToastPrimitive.Title>
          {toast.description && (
            <ToastPrimitive.Description className="text-small text-slate-600 mt-0.5">
              {toast.description}
            </ToastPrimitive.Description>
          )}
          {toast.action && (
            <ToastPrimitive.Action
              className={cn(
                'mt-2 text-small font-medium text-brand-600',
                'hover:text-brand-500 transition-colors',
                'focus:outline-none focus:underline'
              )}
              altText={toast.action.label}
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </ToastPrimitive.Action>
          )}
        </div>
        <ToastPrimitive.Close
          className={cn(
            'flex-shrink-0 p-1 rounded-sm text-slate-400',
            'hover:bg-slate-100 hover:text-slate-600',
            'transition-colors duration-hover',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/40'
          )}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  );
}
