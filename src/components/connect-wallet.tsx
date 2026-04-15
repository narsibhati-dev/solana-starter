'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import '@/styles/wallet.css';

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='bg-accent/10 px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-accent/0 rounded-lg select-none'>
        Connect Wallet
      </div>
    );
  }

  return <WalletMultiButton />;
}
