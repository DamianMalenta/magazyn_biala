import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0 flex-1">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {label}
        </span>
      )}
      <input
        className={clsx(
          'w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-2.5 text-sm font-semibold outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          className,
        )}
        {...props}
      />
    </label>
  );
}
