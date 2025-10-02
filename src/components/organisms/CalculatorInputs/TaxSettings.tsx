// src/components/organisms/CalculatorInputs/TaxSettings.tsx
'use client';

import { motion } from 'framer-motion';
import { MapPin, Settings2 } from 'lucide-react';
import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculatorStore } from '@/store/calculatorStore';

export function TaxSettings() {
  const { input, setTaxCode, setIsScottish } = useCalculatorStore();
  const taxCodeId = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className='p-6'>
        <div className='mb-4 flex items-center gap-2'>
          <Settings2 className='h-5 w-5 text-primary' />
          <h3 className='font-semibold text-lg'>Tax Settings</h3>
        </div>

        <div className='space-y-4'>
          <FormField
            label='Tax Code'
            htmlFor={taxCodeId}
            description='Your HMRC tax code (optional - defaults to standard allowance)'
            tooltip='Find this on your payslip or P60. Common codes: 1257L, S1257L, K code'
          >
            <Input
              id={taxCodeId}
              type='text'
              value={input.taxCode}
              onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
              placeholder='1257L'
              className='uppercase'
            />
          </FormField>

          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              Region
            </Label>
            <div className='flex gap-2'>
              <motion.button
                type='button'
                onClick={() => setIsScottish(false)}
                className={`flex-1 rounded-lg border p-3 text-center text-sm transition-all ${
                  !input.isScottish
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className='font-medium'>England, Wales & NI</div>
                {!input.isScottish && (
                  <Badge variant='default' className='mt-1'>
                    Selected
                  </Badge>
                )}
              </motion.button>

              <motion.button
                type='button'
                onClick={() => setIsScottish(true)}
                className={`flex-1 rounded-lg border p-3 text-center text-sm transition-all ${
                  input.isScottish
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className='font-medium'>Scotland</div>
                {input.isScottish && (
                  <Badge variant='default' className='mt-1'>
                    Selected
                  </Badge>
                )}
              </motion.button>
            </div>
            <p className='text-muted-foreground text-xs'>Scotland has different income tax rates</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
