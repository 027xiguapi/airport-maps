import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui 的类名合并工具:先按条件拼接,再让 tailwind-merge 解决
 * 同组 Tailwind 类的冲突(调用处传入的类覆盖原语的默认类)。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
