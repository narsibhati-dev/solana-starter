'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, Commitment } from '@solana/web3.js';
import toast from 'react-hot-toast';

export default function WalletInfo() {
    const { connected, publicKey } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<number | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(publicKey?.toBase58() || '');
        toast.success('Copied to clipboard');
    };

    useEffect(() => {
        let subscriptionId: number | null = null;

        const fetchBalance = async () => {
            if (!publicKey) return;
            try {
                const lamports = await connection.getBalance(new PublicKey(publicKey));
                setBalance(lamports / LAMPORTS_PER_SOL);
            } catch {
                toast.error('Failed to fetch balance');
                setBalance(null);
            }
        };

        if (connected && publicKey) {
            fetchBalance();
            const commitment: Commitment = 'confirmed';
            subscriptionId = connection.onAccountChange(
                new PublicKey(publicKey),
                accountInfo => {
                    const lamports = accountInfo.lamports ?? 0;
                    setBalance(lamports / LAMPORTS_PER_SOL);
                },
                commitment,
            );
        } else {
            setBalance(null);
        }

        return () => {
            if (subscriptionId !== null) {
                connection.removeAccountChangeListener(subscriptionId).catch(() => { });
            }
        };
    }, [connected, publicKey, connection]);

    if (!connected) {
        return (
            <div className='h-full w-full bg-surface border border-border rounded-xl lg:min-h-48 flex flex-col items-center justify-center gap-3'>
                <div className='w-8 h-8 rounded-full border border-border flex items-center justify-center'>
                    <div className='w-2 h-2 rounded-full bg-border'></div>
                </div>
                <p className='text-xs tracking-widest uppercase text-muted'>No wallet connected</p>
            </div>
        );
    }

    return (
        <div className='h-full w-full bg-surface border border-border rounded-xl lg:min-h-48 overflow-hidden'>
            <div className='px-5 pt-5 pb-4 flex flex-col gap-5'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-success'></div>
                        <span className='text-[10px] tracking-widest uppercase text-muted font-bold'>Connected</span>
                    </div>
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='text-[10px] tracking-widest uppercase text-muted mb-1'>Balance</span>
                    <div className='flex items-baseline gap-2'>
                        <span className='font-display text-6xl text-foreground'>
                            {balance !== null ? balance.toFixed(4) : '----'}
                        </span>
                        <span className='text-sm text-muted font-bold uppercase tracking-widest'>SOL</span>
                    </div>
                </div>

                <div className='flex items-center justify-between gap-3 bg-surface-2 rounded-lg px-3 py-2.5'>
                    <span className='font-mono text-xs text-muted truncate'>
                        {publicKey?.toBase58().slice(0, 10)}···{publicKey?.toBase58().slice(-10)}
                    </span>
                    <button
                        onClick={handleCopy}
                        className='text-[10px] font-bold tracking-widest uppercase text-muted hover:text-accent transition-colors duration-150 cursor-pointer flex-shrink-0'
                    >
                        COPY
                    </button>
                </div>
            </div>
        </div>
    );
}
