import React from 'react';
import { CustomizationGroup, SelectedOptionSnapshot } from '../../types';
import { SelectionRow } from '../ui/SelectionRow';

export interface CustomizationOptionGroupProps {
  group: CustomizationGroup;
  selectedOptions: SelectedOptionSnapshot[];
  onToggleOption: (option: { id: string; name: string; priceDeltaCents: number }) => void;
}

export const CustomizationOptionGroup: React.FC<CustomizationOptionGroupProps> = ({
  group,
  selectedOptions,
  onToggleOption,
}) => {
  const isSelected = (optId: string) => selectedOptions.some((opt) => opt.optionId === optId);

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-border last:border-b-0">
      {/* Group Title & Required Badge */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm text-text-primary">{group.name}</h4>
          {group.isRequired ? (
            <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
              Required
            </span>
          ) : (
            <span className="text-[10px] font-medium text-text-tertiary">Optional</span>
          )}
        </div>
        <span className="text-xs text-text-tertiary">
          {group.selectionType === 'single' ? 'Choose 1' : `Up to ${group.maxSelect}`}
        </span>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2">
        {group.options.map((opt) => (
          <SelectionRow
            key={opt.id}
            id={opt.id}
            name={opt.name}
            priceDeltaCents={opt.priceDeltaCents}
            type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
            selected={isSelected(opt.id)}
            onSelect={() =>
              onToggleOption({
                id: opt.id,
                name: opt.name,
                priceDeltaCents: opt.priceDeltaCents,
              })
            }
            disabled={!opt.isAvailable}
          />
        ))}
      </div>
    </div>
  );
};
