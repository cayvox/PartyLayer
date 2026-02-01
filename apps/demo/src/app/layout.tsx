import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PartyLayer Demo',
  description: 'Demo dApp for PartyLayer SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
