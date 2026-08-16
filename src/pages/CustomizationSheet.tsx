import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { SelectedOptionSnapshot } from '../types';
import { BottomSheet } from '../components/ui/BottomSheet';
import { CustomizationOptionGroup } from '../components/composite/CustomizationOptionGroup';
import { Button } from '../components/ui/Button';
import { PriceTag } from '../components/ui/PriceTag';
import { Badge } from '../components/ui/Badge';
import { formatCentsToCurrency } from '../utils/formatters';

export const CustomizationSheet: React.FC = () => {
  const {
    isCustomizationSheetOpen,
    closeCustomizationSheet,
    activeMenuItemForCustomization,
    addToCart,
  } = useCart();

  if (!activeMenuItemForCustomization) return null;

  const { restaurant, menuItem } = activeMenuItemForCustomization;

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionSnapshot[]>(() => {
    // Preselect defaults for single required options if available
    const initial: SelectedOptionSnapshot[] = [];
    menuItem.customizationGroups.forEach((grp) => {
      if (grp.isRequired && grp.options.length > 0) {
        const defaultOpt = grp.options[0];
        initial.push({
          optionId: defaultOpt.id,
          groupName: grp.name,
          optionName: defaultOpt.name,
          priceDeltaCents: defaultOpt.priceDeltaCents,
        });
      }
    });
    return initial;
  });

  const handleToggleOption = (groupName: string, selectionType: 'single' | 'multi', opt: { id: string; name: string; priceDeltaCents: number }) => {
    setSelectedOptions((prev) => {
      if (selectionType === 'single') {
        // Replace existing selection in this group
        const filtered = prev.filter((o) => o.groupName !== groupName);
        return [
          ...filtered,
          {
            optionId: opt.id,
            groupName,
            optionName: opt.name,
            priceDeltaCents: opt.priceDeltaCents,
          },
        ];
      } else {
        // Multi-select toggle
        const exists = prev.some((o) => o.optionId === opt.id);
        if (exists) {
          return prev.filter((o) => o.optionId !== opt.id);
        } else {
          return [
            ...prev,
            {
              optionId: opt.id,
              groupName,
              optionName: opt.name,
              priceDeltaCents: opt.priceDeltaCents,
            },
          ];
        }
      }
    });
  };

  // Validation: verify every required group has at least 1 selection
  const isValidationPassing = menuItem.customizationGroups.every((grp) => {
    if (!grp.isRequired) return true;
    return selectedOptions.some((o) => o.groupName === grp.name);
  });

  // Calculate live item price
  const optionsDelta = selectedOptions.reduce((acc, opt) => acc + opt.priceDeltaCents, 0);
  const livePriceCents = menuItem.basePriceCents + optionsDelta;

  return (
    <BottomSheet
      isOpen={isCustomizationSheetOpen}
      onClose={closeCustomizationSheet}
      title={menuItem.name}
    >
      <div className="flex flex-col gap-4">
        {/* Description & Base Price */}
        <div>
          <p className="text-xs text-text-secondary leading-relaxed">{menuItem.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <PriceTag cents={menuItem.basePriceCents} size="md" />
            <span className="text-xs text-text-tertiary">base price</span>
          </div>
        </div>

        {/* Allergen Notification */}
        {menuItem.allergens.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {menuItem.allergens.map((a) => (
              <Badge key={a} variant="allergen">
                Contains {a}
              </Badge>
            ))}
          </div>
        )}

        {/* Customization Option Groups */}
        <div className="flex flex-col gap-2 my-2">
          {menuItem.customizationGroups.map((group) => (
            <CustomizationOptionGroup
              key={group.id}
              group={group}
              selectedOptions={selectedOptions}
              onToggleOption={(opt) => handleToggleOption(group.name, group.selectionType, opt)}
            />
          ))}
        </div>

        {/* Action Bar */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-text-tertiary">Live Price Total</span>
            <PriceTag cents={livePriceCents} size="lg" isAccent={true} />
          </div>

          <Button
            onClick={() => addToCart(restaurant, menuItem, selectedOptions)}
            disabled={!isValidationPassing}
            size="lg"
            className="flex-1"
          >
            Add to Cart — {formatCentsToCurrency(livePriceCents)}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
