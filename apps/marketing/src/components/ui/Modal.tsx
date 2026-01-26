import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/design/cn';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

export interface ModalTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function ModalTrigger({ children, asChild = true }: ModalTriggerProps) {
  return <Dialog.Trigger asChild={asChild}>{children}</Dialog.Trigger>;
}

export interface ModalContentProps {
  children: ReactNode;
  className?: string;
  showClose?: boolean;
  title?: string;
  description?: string;
}

export function ModalContent({
  children,
  className,
  showClose = true,
  title,
  description,
}: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-fg/20 backdrop-blur-sm',
          'data-[state=open]:animate-fade-in'
        )}
      />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md max-h-[85vh] overflow-y-auto',
          'bg-bg rounded-lg shadow-modal border border-border',
          'data-[state=open]:animate-slide-up',
          'focus:outline-none',
          className
        )}
      >
        <div className="p-5">
          {(title || showClose) && (
            <div className="flex items-start justify-between mb-4">
              <div>
                {title && (
                  <Dialog.Title className="text-h3 text-fg">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-small text-slate-500 mt-1">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              {showClose && (
                <Dialog.Close
                  className={cn(
                    'p-1.5 rounded-sm text-slate-500',
                    'hover:bg-muted hover:text-fg',
                    'transition-colors duration-hover ease-premium',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500/40'
                  )}
                  aria-label="Close"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </Dialog.Close>
              )}
            </div>
          )}
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
