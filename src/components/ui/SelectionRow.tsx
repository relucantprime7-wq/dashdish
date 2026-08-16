import React from 'react';
import { formatCentsToCurrency } from '../../utils/formatters';

export interface SelectionRowProps {
  id: string;
  name: string;
  priceDeltaCents: number;
  type: 'radio' | 'checkbox';
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const SelectionRow: React.FC<SelectionRowProps> = ({
  id,
  name,
  priceDeltaCents,
  type,
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      onClick={onSelect}
      className={`flex items-center justify-between py-3 px-4 rounded-btn border transition-all cursor-pointer select-none ${
        selected
          ? 'bg-accent/5 border-accent text-text-primary font-medium'
          : 'bg-surface border-border text-text-primary hover:border-text-tertiary'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      <div className="flex items-center gap-3">
        <input
          id={id}
          type={type}
          checked={selected}
          onChange={onSelect}
          disabled={disabled}
          className={`w-4 h-4 text-accent border-border focus:ring-accent ${
            type === 'radio' ? 'rounded-full' : 'rounded'
          }`}
        />
        <span className="text-sm">{name}</span>
      </div>

      <span className="text-sm font-semibold text-text-secondary">
        {priceDeltaCents > 0 ? `+${formatCentsToCurrency(priceDeltaCents)}` : 'Free'}
      </span>
    </label>
  );
};
