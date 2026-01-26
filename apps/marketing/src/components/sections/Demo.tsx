import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/design/cn';
import { wallets, type WalletId } from '@/design/tokens';

interface DemoProps {
  installedWallets: WalletId[];
  onToggleInstalled: (walletId: WalletId) => void;
}

export function Demo({ installedWallets, onToggleInstalled }: DemoProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  const handleWalletConnect = (walletId: WalletId) => {
    const wallet = wallets.find((w) => w.id === walletId);
    const isInstalled = installedWallets.includes(walletId);

    if (!isInstalled) {
      addToast({
        type: 'error',
        title: 'WALLET_NOT_INSTALLED',
        description: `${wallet?.name} is not installed. Please install the wallet extension or app.`,
        action: {
          label: 'Install wallet',
          onClick: () => window.open('#wallets', '_self'),
        },
      });
    } else {
      addToast({
        type: 'success',
        title: 'SESSION_CONNECTED',
        description: `Successfully connected to ${wallet?.name}. Session established.`,
      });
      setModalOpen(false);
    }
  };

  return (
    <section className="py-20 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-h2 text-fg mb-3">Interactive demo</h2>
          <p className="text-body text-slate-500 max-w-xl mx-auto">
            Try the wallet connection flow. Toggle installed wallets to see different behaviors.
          </p>
        </div>

        <Card variant="default">
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Controls */}
              <div>
                <h3 className="text-h3 text-fg mb-4">Simulation controls</h3>
                <p className="text-small text-slate-500 mb-4">
                  Toggle which wallets are "installed" to test different connection scenarios.
                </p>

                <div className="space-y-3">
                  {wallets.map((wallet) => {
                    const isInstalled = installedWallets.includes(wallet.id);

                    return (
                      <label
                        key={wallet.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-md border cursor-pointer',
                          'transition-all duration-hover',
                          isInstalled
                            ? 'border-green-200 bg-green-50'
                            : 'border-border bg-bg hover:bg-muted'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isInstalled}
                          onChange={() => onToggleInstalled(wallet.id)}
                          className={cn(
                            'w-4 h-4 rounded border-2',
                            'accent-brand-500 cursor-pointer'
                          )}
                        />
                        <img
                          src={wallet.logo}
                          alt={`${wallet.name} logo`}
                          className="w-8 h-8 rounded-md"
                        />
                        <span className="flex-1 font-medium text-fg">{wallet.name}</span>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isInstalled ? 'text-green-600' : 'text-slate-400'
                          )}
                        >
                          {isInstalled ? 'Installed' : 'Not installed'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Demo Area */}
              <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-muted/50 border border-border">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-brand-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-brand-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                      />
                    </svg>
                  </div>
                  <h4 className="text-h3 text-fg mb-2">Your dApp</h4>
                  <p className="text-small text-slate-500">
                    Click the button to open the wallet connection modal.
                  </p>
                </div>

                <Button variant="primary" size="lg" onClick={() => setModalOpen(true)}>
                  Connect Wallet
                </Button>

                <p className="mt-4 text-xs text-slate-400">
                  Try connecting to installed vs uninstalled wallets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Modal */}
        <Modal open={modalOpen} onOpenChange={setModalOpen}>
          <ModalContent
            title="Connect Wallet"
            description="Select a wallet to connect to this dapp."
          >
            <div className="space-y-2">
              {wallets.map((wallet) => {
                const isInstalled = installedWallets.includes(wallet.id);

                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletConnect(wallet.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-md border',
                      'transition-all duration-hover text-left',
                      'hover:bg-muted hover:border-slate-300',
                      'focus:outline-none focus:ring-2 focus:ring-brand-500/40'
                    )}
                  >
                    <img
                      src={wallet.logo}
                      alt={`${wallet.name} logo`}
                      className="w-10 h-10 rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-fg">{wallet.name}</span>
                        <span className="badge badge-verified">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{wallet.transport}</p>
                    </div>
                    {isInstalled ? (
                      <span className="badge badge-installed">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Installed
                      </span>
                    ) : (
                      <span className="badge badge-not-installed">Not installed</span>
                    )}
                  </button>
                );
              })}
            </div>
          </ModalContent>
        </Modal>
      </div>
    </section>
  );
}
