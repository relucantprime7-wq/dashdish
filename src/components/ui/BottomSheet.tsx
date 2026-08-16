import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-text-primary/50 transition-opacity backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-card sm:rounded-card shadow-sheet max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
        {/* Top Handle bar for mobile drag affordance */}
        <div className="w-full flex justify-center py-2 sm:hidden">
          <div className="w-12 h-1.5 bg-border rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          {title ? (
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg rounded-full transition-colors"
            aria-label="Close sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
