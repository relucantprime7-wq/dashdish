import React from 'react';
import { formatCentsToCurrency } from '../../utils/formatters';
import { CheckCircle2 } from 'lucide-react';

export interface PriceTagProps {
  cents: number;
  originalCents?: number;
  size?: 'sm' | 'md' | 'lg' | 'display';
  showHonestyCheck?: boolean;
  honestyLabel?: string;
  isAccent?: boolean;
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  cents,
  originalCents,
  size = 'md',
  showHonestyCheck = false,
  honestyLabel = 'All fees shown',
  isAccent = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-semibold',
    display: 'text-2xl font-bold',
  };

  const textColor = isAccent ? 'text-accent' : 'text-text-primary';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {originalCents !== undefined && originalCents !== cents && (
        <span className="text-text-tertiary line-through text-xs font-normal">
          {formatCentsToCurrency(originalCents)}
        </span>
      )}
      <span className={`${sizeClasses[size]} ${textColor}`}>
        {formatCentsToCurrency(cents)}
      </span>
      {showHonestyCheck && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-honesty/10 text-honesty text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-honesty shrink-0" />
          {honestyLabel}
        </span>
      )}
    </span>
  );
};
