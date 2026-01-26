import { Logo } from '@/components/Logo';
import { cn } from '@/design/cn';

const links = [
  {
    label: 'GitHub',
    href: 'https://github.com/cayvox/CantonConnect',
    external: true,
  },
  {
    label: 'npm',
    href: 'https://www.npmjs.com/package/@cantonconnect/sdk',
    external: true,
  },
  {
    label: 'Issues',
    href: 'https://github.com/cayvox/CantonConnect/issues',
    external: true,
  },
  {
    label: 'Discussions',
    href: 'https://github.com/cayvox/CantonConnect/discussions',
    external: true,
  },
  {
    label: 'License',
    href: 'https://github.com/cayvox/CantonConnect/blob/main/LICENSE',
    external: true,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Branding */}
          <div>
            <Logo size="lg" />
            <p className="mt-4 text-body text-slate-500 max-w-sm">
              One SDK for every Canton wallet. Open source, registry-backed, and built for developers.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={cn(
                  'text-small font-medium text-slate-500',
                  'hover:text-fg transition-colors duration-hover',
                  'inline-flex items-center gap-1'
                )}
              >
                {link.label}
                {link.external && (
                  <svg
                    className="w-3 h-3 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-small text-slate-400">
              © {year} CantonConnect. MIT License.
            </p>

            {/* Built by Cayvox Labs */}
            <div className="flex items-center gap-3 text-small text-slate-400">
              <span>Built by</span>
              <a
                href="https://cayvox.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-1.5 font-medium',
                  'text-fg hover:text-brand-600 transition-colors duration-hover'
                )}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Cayvox Labs
              </a>
              <span className="text-brand-500">✦</span>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-4 text-center sm:text-right">
            <a
              href="mailto:info@cayvox.com"
              className="text-small text-slate-400 hover:text-brand-600 transition-colors duration-hover"
            >
              info@cayvox.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
