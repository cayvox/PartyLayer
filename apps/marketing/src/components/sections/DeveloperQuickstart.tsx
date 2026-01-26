import { useState } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { cn } from '@/design/cn';

const tabs = [
  {
    id: 'install',
    label: 'Install',
    code: `npm install @cantonconnect/sdk @cantonconnect/react

# or with yarn
yarn add @cantonconnect/sdk @cantonconnect/react

# or with pnpm
pnpm add @cantonconnect/sdk @cantonconnect/react`,
    language: 'bash',
  },
  {
    id: 'init',
    label: 'Initialize',
    code: `import { createCantonConnect } from '@cantonconnect/sdk';

// Create the client with default config
const client = createCantonConnect({
  // Optional: specify registry URL
  registryUrl: 'https://registry.cantonconnect.xyz',
  
  // Optional: enable debug logging
  debug: process.env.NODE_ENV === 'development',
});

export default client;`,
    language: 'typescript',
  },
  {
    id: 'react',
    label: 'React Setup',
    code: `import { CantonConnectProvider } from '@cantonconnect/react';
import client from './cantonconnect';

function App() {
  return (
    <CantonConnectProvider client={client}>
      <YourApp />
    </CantonConnectProvider>
  );
}

// In your component:
import { useCantonConnect } from '@cantonconnect/react';

function ConnectButton() {
  const { connect, disconnect, session, isConnected } = useCantonConnect();

  if (isConnected) {
    return (
      <button onClick={disconnect}>
        Connected: {session?.address?.slice(0, 8)}...
      </button>
    );
  }

  return <button onClick={connect}>Connect Wallet</button>;
}`,
    language: 'tsx',
  },
];

export function DeveloperQuickstart() {
  const [activeTab, setActiveTab] = useState('install');
  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <section id="quickstart" className="py-20 bg-muted/30 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-h2 text-fg mb-3">Developer quickstart</h2>
          <p className="text-body text-slate-500 max-w-xl mx-auto">
            Add wallet connectivity to your Canton dapp in minutes.
          </p>
        </div>

        {/* Code Tabs */}
        <div className="bg-bg rounded-lg border border-border shadow-card overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 px-4 py-3 text-small font-medium',
                  'transition-colors duration-hover',
                  'focus:outline-none focus:bg-muted',
                  activeTab === tab.id
                    ? 'bg-muted text-fg border-b-2 border-brand-500 -mb-px'
                    : 'text-slate-500 hover:text-fg hover:bg-muted/50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Content */}
          <div className="p-1">
            <CodeBlock
              code={activeTabData.code}
              language={activeTabData.language}
              showLineNumbers
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/cayvox/CantonConnect#readme"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md',
              'bg-brand-500 text-fg font-medium',
              'hover:bg-brand-600 transition-colors duration-hover',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Full Documentation
          </a>
          <a
            href="https://github.com/cayvox/CantonConnect/tree/main/examples"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md',
              'border border-border text-fg font-medium',
              'hover:bg-muted transition-colors duration-hover',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Example Projects
          </a>
        </div>
      </div>
    </section>
  );
}
