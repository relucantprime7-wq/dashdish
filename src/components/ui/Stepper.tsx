import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const btnSize = isSm ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = isSm ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = isSm ? 'text-xs min-w-[20px]' : 'text-sm font-semibold min-w-[28px]';

  return (
    <div className="inline-flex items-center gap-1.5 bg-bg p-1 rounded-btn border border-border">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnSize} flex items-center justify-center rounded-btn bg-surface text-text-primary border border-border hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-colors`}
        aria-label="Decrease quantity"
      >
        <Minus className={iconSize} />
      </button>

      <span className={`${textSize} text-center text-text-primary select-none`}>
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnSize} flex items-center justify-center rounded-btn bg-surface text-text-primary border border-border hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-colors`}
        aria-label="Increase quantity"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
};
