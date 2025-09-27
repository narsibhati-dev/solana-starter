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

    // keep SOL balance live via account change subscription
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
            <p className='h-full w-full shadow-lg rounded-lg bg-white/10 text-gray-200 lg:min-h-48 flex items-center justify-center ring ring-neutral-700'>
                No wallet connected
            </p>
        );
    }

    return (
        <div className='flex h-full w-full flex-col items-center justify-center rounded-lg bg-white/10 p-4 shadow-lg lg:min-h-48 ring ring-neutral-700'>
            <p className='flex flex-wrap items-center gap-2 truncate text-center font-mono text-xs text-gray-200 lg:text-base'>
                <span className='font-semibold'>Wallet:</span>{' '}
                {publicKey?.toBase58().slice(0, 10)}...
                {publicKey?.toBase58().slice(-10)}
                <button
                    className='cursor-pointer rounded-md bg-gradient-to-r from-purple-300 to-purple-200 p-1 text-black lg:px-2 shadow-lg hover:scale-102 transition-all duration-200 ease-in-out'
                    onClick={handleCopy}
                >
                    Copy
                </button>
            </p>
            <p className='mt-2 truncate text-center text-lg font-bold text-purple-300'>
                Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
            </p>
        </div>
    );
}
