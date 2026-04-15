import type { Metadata } from 'next';
import { IBM_Plex_Mono, Bebas_Neue } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/providers';
import Header from '@/components/header';
import { Toaster } from 'react-hot-toast';

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Solana Devnet',
  description: 'Solana Starter — Devnet',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${ibmPlexMono.variable} ${bebasNeue.variable} mx-auto max-w-7xl px-4 antialiased bg-background text-foreground`}
      >
        <Toaster
          position='top-right'
          toastOptions={{
            style: {
              background: '#161616',
              color: '#e8e4dc',
              border: '1px solid #2a2a2a',
              borderRadius: '0px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '12px',
              letterSpacing: '0.02em',
              boxShadow: 'none',
            },
            success: {
              iconTheme: {
                primary: '#5a8f4e',
                secondary: '#161616',
              },
            },
            error: {
              iconTheme: {
                primary: '#c94040',
                secondary: '#161616',
              },
            },
          }}
        />
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
