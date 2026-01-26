import { cn } from '@/design/cn';

export interface LogoProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { icon: 'w-6 h-6', text: 'text-lg' },
  md: { icon: 'w-8 h-8', text: 'text-xl' },
  lg: { icon: 'w-10 h-10', text: 'text-2xl' },
};

export function Logo({ className, showIcon = true, size = 'md' }: LogoProps) {
  const styles = sizeStyles[size];

  return (
    <a
      href="/"
      className={cn(
        'inline-flex items-center gap-2 font-semibold text-fg',
        'hover:opacity-80 transition-opacity duration-hover',
        className
      )}
    >
      {showIcon && (
        <svg
          className={styles.icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="8" fill="#FFCC00" />
          <path
            d="M16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26C21.523 26 26 21.523 26 16C26 10.477 21.523 6 16 6ZM16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24C11.582 24 8 20.418 8 16C8 11.582 11.582 8 16 8Z"
            fill="#0B0F1A"
          />
          <circle cx="16" cy="16" r="4" fill="#0B0F1A" />
        </svg>
      )}
      <span className={styles.text}>CantonConnect</span>
    </a>
  );
}
