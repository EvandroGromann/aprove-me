import React, { ChangeEvent, forwardRef, useCallback } from 'react';
import { Input } from './Input';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | '';
  onChange: (value: number | '') => void;
  className?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className = '', ...props }, ref) => {
    
    const formatValue = (num: number | ''): string => {
      if (num === '') return '';
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    const parseValue = (val: string): number | '' => {
      if (!val) return '';
      const clean = val.replace(/\D/g, '');
      return clean ? Number(clean) / 100 : '';
    };

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(parseValue(val));
    }, [onChange]);

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          R$
        </div>
        <Input
          ref={ref}
          type="text"
          value={value === '' ? '' : formatValue(value)}
          onChange={handleChange}
          placeholder="0,00"
          className={`pl-9 ${className}`}
          inputMode="numeric"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
