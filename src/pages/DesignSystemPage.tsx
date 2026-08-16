import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { PriceTag } from '../components/ui/PriceTag';
import { Badge } from '../components/ui/Badge';
import { Stepper } from '../components/ui/Stepper';
import { TextInput } from '../components/ui/TextInput';
import { SelectionRow } from '../components/ui/SelectionRow';
import { SkeletonBlock } from '../components/ui/SkeletonBlock';
import { PriceBreakdownPanel } from '../components/composite/PriceBreakdownPanel';
import { Search } from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const [stepperVal, setStepperVal] = useState<number>(2);
  const [radioSelected, setRadioSelected] = useState<string>('opt_1');
  const [checkSelected, setCheckSelected] = useState<boolean>(true);
  const [textInputVal, setTextInputVal] = useState<string>('');

  const samplePricing = {
    subtotalCents: 2798,
    deliveryFeeCents: 299,
    serviceFeeCents: 199,
    taxCents: 224,
    tipCents: 300,
    discountCents: 0,
    totalCents: 3820,
    lineItems: [],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-20 flex flex-col gap-10">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-2">
          Design System & Foundation
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary">DashDish Design Tokens & Primitives</h1>
        <p className="text-sm text-text-secondary mt-1">
          Strictly compliant with <code className="bg-bg px-1.5 py-0.5 rounded border border-border">UX_SPEC.md §PART A</code>. All components consume system tokens.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="bg-surface rounded-card border border-border p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary">1. Color Palette Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <div className="h-14 rounded-btn bg-bg border border-border" />
            <span className="text-xs font-semibold text-text-primary">Background</span>
            <code className="text-[11px] text-text-tertiary">#FAFAF8</code>
          </div>

          <div className="flex flex-col gap-1">
            <div className="h-14 rounded-btn bg-accent shadow-xs" />
            <span className="text-xs font-semibold text-text-primary">Accent Primary</span>
            <code className="text-[11px] text-text-tertiary">#E4572E</code>
          </div>

          <div className="flex flex-col gap-1">
            <div className="h-14 rounded-btn bg-honesty shadow-xs" />
            <span className="text-xs font-semibold text-text-primary">Honesty & Check</span>
            <code className="text-[11px] text-text-tertiary">#1B8A5A</code>
          </div>

          <div className="flex flex-col gap-1">
            <div className="h-14 rounded-btn bg-text-primary" />
            <span className="text-xs font-semibold text-text-primary">Text Primary</span>
            <code className="text-[11px] text-text-tertiary">#14151A</code>
          </div>
        </div>
      </section>

      {/* 2. Foundational Buttons */}
      <section className="bg-surface rounded-card border border-border p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary">2. Buttons (UX_SPEC.md §A.4)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary CTA</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost Action</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" isLoading>Processing</Button>
          <Button variant="primary" disabled>Disabled State</Button>
        </div>
      </section>

      {/* 3. PriceTag Primitive */}
      <section className="bg-surface rounded-card border border-border p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary">3. PriceTag (Single Source of Price Rendering)</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-tertiary">Standard</span>
            <PriceTag cents={1299} size="md" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-text-tertiary">With Strikethrough</div>
            <PriceTag cents={1299} originalCents={1599} size="md" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-tertiary">Accent Display</span>
            <PriceTag cents={3820} size="display" isAccent={true} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-tertiary">Honesty Badge Tag</span>
            <PriceTag cents={3820} size="lg" showHonestyCheck={true} />
          </div>
        </div>
      </section>

      {/* 4. Badges */}
      <section className="bg-surface rounded-card border border-border p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary">4. Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="honesty">Honesty Verified</Badge>
          <Badge variant="eta">25–32 min</Badge>
          <Badge variant="allergen">Contains Nuts</Badge>
          <Badge variant="promo">WELCOME10 Applied</Badge>
          <Badge variant="neutral">Single Restaurant</Badge>
        </div>
      </section>

      {/* 5. Stepper & Form Controls */}
      <section className="bg-surface rounded-card border border-border p-6 flex flex-col gap-6">
        <h2 className="text-lg font-bold text-text-primary">5. Form Controls & Selection Rows</h2>
        
        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">Quantity Stepper:</span>
            <Stepper value={stepperVal} onChange={setStepperVal} />
          </div>

          <TextInput
            label="Promo Code / Address Search"
            placeholder="Type code here..."
            value={textInputVal}
            onChange={(e) => setTextInputVal(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-semibold text-text-secondary">Customization Radio Choice:</span>
            <SelectionRow
              id="opt_1"
              name="Warm Quinoa & Brown Rice"
              priceDeltaCents={0}
              type="radio"
              selected={radioSelected === 'opt_1'}
              onSelect={() => setRadioSelected('opt_1')}
            />
            <SelectionRow
              id="opt_2"
              name="Gluten-Free Base"
              priceDeltaCents={250}
              type="radio"
              selected={radioSelected === 'opt_2'}
              onSelect={() => setRadioSelected('opt_2')}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-semibold text-text-secondary">Customization Checkbox Choice:</span>
            <SelectionRow
              id="opt_3"
              name="Fresh Hass Avocado"
              priceDeltaCents={200}
              type="checkbox"
              selected={checkSelected}
              onSelect={() => setCheckSelected(!checkSelected)}
            />
          </div>
        </div>
      </section>

      {/* 6. Skeleton Loaders */}
      <section className="bg-surface rounded-card border border-border p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary">6. Skeleton Loader Primitives</h2>
        <div className="flex flex-col gap-3">
          <SkeletonBlock height="24px" width="50%" />
          <SkeletonBlock height="16px" width="80%" />
          <SkeletonBlock height="120px" width="100%" rounded="rounded-card" />
        </div>
      </section>

      {/* 7. Shared PriceBreakdownPanel */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary">7. Single Source of Truth Price Breakdown Panel</h2>
        <PriceBreakdownPanel pricing={samplePricing} />
      </section>
    </div>
  );
};
