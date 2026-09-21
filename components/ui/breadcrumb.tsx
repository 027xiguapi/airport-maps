import { Slot } from '@radix-ui/react-slot';
import { ChevronRightIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Breadcrumb 家族。站内面包屑只出现在深蓝的 .page-head 上
 * (.crumb 同款),所以默认配色是白透明文字 + hover 琥珀色,而不是
 * shadcn 常规的 muted-foreground。
 */
function Breadcrumb({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label="breadcrumb"
      className={cn('text-[13px] text-white/[0.62]', className)}
      {...props}
    />
  );
}

function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  className,
  asChild = false,
  ...props
}: ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn('transition-colors duration-150 hover:text-amber', className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-white/[0.62]', className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('opacity-50 [&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
