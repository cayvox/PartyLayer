import { useState } from 'react';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Nav } from '@/components/Nav';
import { Background } from '@/components/Background';
import {
  Hero,
  ProofBar,
  HowItWorks,
  WalletGrid,
  DeveloperQuickstart,
  FAQ,
  Footer,
} from '@/components/sections';
import { Demo } from '@/components/sections/Demo';
import { wallets, type WalletId } from '@/design/tokens';

function AppContent() {
  // Demo state: track which wallets are "installed"
  const [installedWallets, setInstalledWallets] = useState<WalletId[]>(['console']);
  const { addToast } = useToast();

  const handleToggleInstalled = (walletId: WalletId) => {
    setInstalledWallets((prev) =>
      prev.includes(walletId)
        ? prev.filter((id) => id !== walletId)
        : [...prev, walletId]
    );
  };

  const handleWalletClick = (walletId: WalletId) => {
    const isInstalled = installedWallets.includes(walletId);
    const wallet = wallets.find((w) => w.id === walletId);
    const walletName = wallet?.name ?? walletId;

    if (isInstalled) {
      addToast({
        type: 'success',
        title: 'SESSION_CONNECTED',
        description: `Successfully connected to ${walletName}.`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'WALLET_NOT_INSTALLED',
        description: `${walletName} is not installed.`,
      });
    }
  };

  const handleOpenDemo = () => {
    const demoSection = document.getElementById('demo');
    demoSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Background>
      <Nav />
      <main>
        <Hero onOpenDemo={handleOpenDemo} />
        <ProofBar />
        <HowItWorks />
        <WalletGrid
          installedWallets={installedWallets}
          onWalletClick={handleWalletClick}
        />
        <DeveloperQuickstart />
        <section id="demo">
          <Demo
            installedWallets={installedWallets}
            onToggleInstalled={handleToggleInstalled}
          />
        </section>
        <FAQ />
      </main>
      <Footer />
    </Background>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
