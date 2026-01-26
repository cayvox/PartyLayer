import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * This handles class conflicts intelligently (e.g., 'p-2 p-4' → 'p-4')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
