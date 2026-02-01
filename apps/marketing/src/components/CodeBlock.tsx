import { useState } from 'react';
import { cn } from '@/design/cn';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'tsx',
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const lines = code.split('\n');

  return (
    <div className={cn('relative group', className)}>
      <div className="bg-slate-900 rounded-md overflow-hidden border border-slate-800">
        {/* Header with filename */}
        {filename && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400">{filename}</span>
            <CopyButton copied={copied} onClick={handleCopy} />
          </div>
        )}

        {/* Code content */}
        <div className="relative overflow-hidden">
          {!filename && (
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton copied={copied} onClick={handleCopy} />
            </div>
          )}

          <pre className="p-4 overflow-x-auto scrollbar-hide max-w-full">
            <code className="text-sm font-mono text-slate-300 leading-relaxed table w-full">
              {lines.map((line, i) => (
                <div key={i} className="table-row">
                  {showLineNumbers && (
                    <span className="table-cell pr-4 text-right text-slate-600 select-none">
                      {i + 1}
                    </span>
                  )}
                  <span className="table-cell">
                    <HighlightedLine line={line} language={language} />
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
}

function CopyButton({ copied, onClick }: CopyButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-sm transition-all duration-hover',
        'text-slate-400 hover:text-slate-200 hover:bg-slate-700',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/40'
      )}
      aria-label={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

// Simple syntax highlighting
interface HighlightedLineProps {
  line: string;
  language: string;
}

function HighlightedLine({ line }: HighlightedLineProps) {
  // Simple tokenization for common patterns
  const tokens = tokenize(line);

  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={token.className}>
          {token.value}
        </span>
      ))}
      {'\n'}
    </>
  );
}

interface Token {
  value: string;
  className?: string;
}

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  const patterns: [RegExp, string][] = [
    // Comments
    [/^(\/\/.*)/, 'text-slate-500'],
    // Strings
    [/^("[^"]*"|'[^']*'|`[^`]*`)/, 'text-green-400'],
    // Keywords
    [/^(import|from|export|const|let|var|function|return|if|else|for|while|class|extends|new|async|await|try|catch|throw)\b/, 'text-purple-400'],
    // Types / React
    [/^(React|useState|useEffect|useCallback|useMemo|useRef|FC|ReactNode)\b/, 'text-blue-400'],
    // Numbers
    [/^(\d+\.?\d*)/, 'text-amber-400'],
    // Operators
    [/^(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:])/, 'text-cyan-400'],
    // JSX tags
    [/^(<\/?[A-Z][a-zA-Z0-9]*|<\/?[a-z][a-zA-Z0-9]*)/, 'text-red-400'],
    // Properties/attributes
    [/^([a-zA-Z_]\w*)\s*=/, 'text-orange-300'],
    // Default text
    [/^(\S+|\s+)/, ''],
  ];

  while (remaining.length > 0) {
    let matched = false;

    for (const [pattern, className] of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        tokens.push({ value: match[1], className });
        remaining = remaining.slice(match[1].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      tokens.push({ value: remaining[0], className: '' });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}
