import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/** shadcn/ui Input,38px 高度、站点令牌配色(focus 为 sky 色 ring)。 */
function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-[38px] w-full min-w-0 rounded-[10px] border border-input bg-card px-4 py-0 text-[14px] text-ink transition-[border-color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-ink-faint disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20',
        className
      )}
      {...props}
    />
  );
}

export { Input };
