import React from 'react';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export interface BadgeProps {
  variant?: 'honesty' | 'allergen' | 'eta' | 'promo' | 'neutral';
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon = true,
  className = '',
}) => {
  const styles = {
    honesty: 'bg-honesty/10 text-honesty border border-honesty/20 font-medium',
    allergen: 'bg-warning/10 text-warning border border-warning/20 font-medium',
    eta: 'bg-bg text-text-primary border border-border font-semibold',
    promo: 'bg-accent/10 text-accent border border-accent/20 font-medium',
    neutral: 'bg-bg text-text-secondary border border-border font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${styles[variant]} ${className}`}>
      {icon && variant === 'honesty' && <ShieldCheck className="w-3.5 h-3.5 text-honesty" />}
      {icon && variant === 'eta' && <Clock className="w-3.5 h-3.5 text-text-secondary" />}
      {icon && variant === 'allergen' && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
      {children}
    </span>
  );
};
