import { clsx } from 'clsx';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {label}
        </span>
      )}
      <select
        className={clsx(
          'w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
