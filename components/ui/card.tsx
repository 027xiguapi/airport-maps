import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Card 家族。基础盒只定边框/底色/圆角(14px,对齐站内卡片),
 * 阴影与内边距交给调用处以 className 传入——站内卡片本就分「带阴影」
 * (.update-list/.info-panel)与「不带」(.guide-card)两派。
 * `asChild` 让整张卡渲染为子元素(整卡可点的 Link 卡片用)。
 */
function Card({
  className,
  asChild = false,
  ...props
}: ComponentProps<'div'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="card"
      className={cn(
        'flex flex-col rounded-[14px] border border-border bg-card text-card-foreground',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5 px-[22px] pt-5', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-semibold leading-none text-navy-900 dark:text-[#E9F2FA]', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-[13px] text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-[22px]', className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-[22px] pb-5', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
