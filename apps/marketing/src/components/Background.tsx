import { cn } from '@/design/cn';

export interface BackgroundProps {
  className?: string;
  children: React.ReactNode;
}

export function Background({ className, children }: BackgroundProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Premium gradient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 204, 0, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 0%, rgba(255, 204, 0, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 0%, rgba(255, 204, 0, 0.04) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid pattern (very subtle) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0B0F1A 1px, transparent 1px),
            linear-gradient(to bottom, #0B0F1A 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
