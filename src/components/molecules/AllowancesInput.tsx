// src/components/molecules/AllowancesInput.tsx
'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import {
  type AllowanceType,
  type PayPeriod,
  PERIODS,
  type TaxAllowance,
} from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import NumberInput from '../atoms/NumberInput';

interface AllowancesInputProps {
  allowances: TaxAllowance[];
  onChange: (allowances: TaxAllowance[]) => void;
  className?: string;
}

const ALLOWANCE_TYPES: { value: AllowanceType; label: string; description: string }[] = [
  {
    value: 'workingFromHome',
    label: 'Working from Home',
    description: 'Tax relief for required home working (typically £26/month)',
  },
  {
    value: 'professionalSubscriptions',
    label: 'Professional Subscriptions',
    description: 'Fees paid to approved professional bodies',
  },
  {
    value: 'uniformUpkeep',
    label: 'Uniform or Tool Allowance',
    description: 'For maintenance of work clothes or tools',
  },
  {
    value: 'businessTravel',
    label: 'Business Travel',
    description: 'Unreimbursed travel expenses for work',
  },
  {
    value: 'toolsEquipment',
    label: 'Tools & Equipment',
    description: 'Expenses for required work tools',
  },
  {
    value: 'vehicleExpenses',
    label: 'Vehicle Expenses',
    description: 'Mileage and vehicle costs for work',
  },
  {
    value: 'other',
    label: 'Other Tax Relief',
    description: 'Any other HMRC approved tax reliefs',
  },
];

const PERIOD_OPTIONS = [
  { value: PERIODS.ANNUALLY, label: 'Annual' },
  { value: PERIODS.MONTHLY, label: 'Monthly' },
  { value: PERIODS.WEEKLY, label: 'Weekly' },
];

const AllowancesInput: React.FC<AllowancesInputProps> = ({ allowances, onChange, className }) => {
  const [newAllowanceType, setNewAllowanceType] = useState<AllowanceType>('workingFromHome');
  const [newAllowanceAmount, setNewAllowanceAmount] = useState<number>(26); // Default £26/month for WFH
  const [newAllowancePeriod, setNewAllowancePeriod] = useState<PayPeriod>(PERIODS.MONTHLY);
  const [newAllowanceName, setNewAllowanceName] = useState<string>('');

  // Add a new allowance
  const handleAddAllowance = () => {
    // Get the selected type info
    const typeInfo = ALLOWANCE_TYPES.find((type) => type.value === newAllowanceType);

    if (!typeInfo) return;

    // Create name if not provided
    const name = newAllowanceName || typeInfo.label;

    const newAllowance: TaxAllowance = {
      type: newAllowanceType,
      name,
      description: typeInfo.description,
      amount: newAllowanceAmount,
      period: newAllowancePeriod,
    };

    onChange([...allowances, newAllowance]);

    // Reset form for next entry
    setNewAllowanceAmount(0);
    setNewAllowanceName('');
  };

  // Remove an allowance
  const handleRemoveAllowance = (allowanceToRemove: TaxAllowance) => {
    const updatedAllowances = allowances.filter(
      (allowance) =>
        !(
          allowance.name === allowanceToRemove.name &&
          allowance.type === allowanceToRemove.type &&
          allowance.amount === allowanceToRemove.amount
        )
    );
    onChange(updatedAllowances);
  };

  // Set default amount when type changes
  const handleTypeChange = (type: AllowanceType) => {
    setNewAllowanceType(type);

    // Set sensible defaults based on type
    if (type === 'workingFromHome') {
      setNewAllowanceAmount(26);
      setNewAllowancePeriod(PERIODS.MONTHLY);
    } else if (type === 'uniformUpkeep') {
      setNewAllowanceAmount(60);
      setNewAllowancePeriod(PERIODS.ANNUALLY);
    } else {
      setNewAllowanceAmount(0);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* List of current allowances with enhanced glassmorphic styling */}
      {allowances.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground mb-2">Added Allowances</h4>
          <div className="glass-card-l3 backdrop-blur-glass-sm rounded-lg border-glass overflow-hidden divide-y divide-border/20">
            {allowances.map((allowance) => (
              <div
                key={`${allowance.type}-${allowance.name}-${allowance.amount}`}
                className="p-3 flex justify-between items-center hover:bg-glass-l2 transition-colors duration-200"
              >
                <div>
                  <div className="font-medium text-sm text-foreground">{allowance.name}</div>
                  <div className="text-xs text-foreground/70">
                    {`£${allowance.amount} per ${allowance.period}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAllowance(allowance)}
                  className="text-destructive hover:text-destructive/80 p-1 rounded-full hover:bg-glass-l2 transition-colors duration-200"
                  aria-label="Remove allowance"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new allowance form with enhanced glassmorphic styling */}
      <div className="glass-card-l2 backdrop-blur-glass-sm rounded-lg border-glass overflow-hidden relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 -z-10" />

        <div className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
            <div className="p-1 rounded-full bg-glass-l3 backdrop-blur-glass-sm mr-2 text-primary/80">
              <PlusCircle size={14} />
            </div>
            Add Tax Relief or Allowance
          </h4>

          <div className="space-y-4">
            {/* Allowance Type */}
            <div>
              <label
                htmlFor="allowance-type"
                className="block text-xs font-medium text-foreground mb-1.5"
              >
                Type of Allowance
              </label>
              <select
                id="allowance-type"
                value={newAllowanceType}
                onChange={(e) => handleTypeChange(e.target.value as AllowanceType)}
                className="w-full py-2 px-3 glass-input backdrop-blur-glass-sm border-glass rounded-md shadow-glass-sm focus:outline-none focus:ring-1 focus:ring-primary focus:glow-sm transition-all duration-200"
              >
                {ALLOWANCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional custom name */}
            <div>
              <label
                htmlFor="allowance-name"
                className="block text-xs font-medium text-foreground mb-1.5"
              >
                Custom Name (Optional)
              </label>
              <input
                type="text"
                id="allowance-name"
                value={newAllowanceName}
                onChange={(e) => setNewAllowanceName(e.target.value)}
                placeholder="e.g. Professional Membership"
                className="w-full py-2 px-3 glass-input backdrop-blur-glass-sm border-glass rounded-md shadow-glass-sm focus:outline-none focus:ring-1 focus:ring-primary focus:glow-sm transition-all duration-200"
              />
            </div>

            {/* Amount and Period with enhanced glassmorphic styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="allowance-amount"
                  className="block text-xs font-medium text-foreground mb-1.5"
                >
                  Amount
                </label>
                <NumberInput
                  id="allowance-amount"
                  value={newAllowanceAmount}
                  onChange={setNewAllowanceAmount}
                  prefix="£"
                  decimals={2}
                />
              </div>

              <div>
                <label
                  htmlFor="allowance-period"
                  className="block text-xs font-medium text-foreground mb-1.5"
                >
                  Period
                </label>
                <select
                  id="allowance-period"
                  value={newAllowancePeriod}
                  onChange={(e) => setNewAllowancePeriod(e.target.value as PayPeriod)}
                  className="w-full py-2 px-3 glass-input backdrop-blur-glass-sm border-glass rounded-md shadow-glass-sm focus:outline-none focus:ring-1 focus:ring-primary focus:glow-sm transition-all duration-200"
                >
                  {PERIOD_OPTIONS.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add button with enhanced glass styling */}
            <button
              type="button"
              onClick={handleAddAllowance}
              disabled={newAllowanceAmount <= 0}
              className="glass-btn-primary w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium relative overflow-hidden group transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Gradient background */}
              <span className="absolute inset-0 bg-gradient-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

              {/* Button content */}
              <span className="relative z-10 flex items-center">
                <PlusCircle size={16} className="mr-2" />
                Add Allowance
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Info text with glass styling */}
      <div className="glass-card-l3 backdrop-blur-glass-sm p-3 rounded-lg text-xs text-foreground/70 border-l-2 border-primary/20">
        <p>
          Tax allowances reduce your taxable income. Only include allowances that you're eligible
          for based on HMRC rules.
        </p>
      </div>
    </div>
  );
};

export default AllowancesInput;
