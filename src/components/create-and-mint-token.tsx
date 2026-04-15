'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import {
    getAccount,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

export default function CreateAndMintToken() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [mintAddress, setMintAddress] = useState<string | null>(null);
    const [mintList, setMintList] = useState<string[]>([]);
    const [tokenBalance, setTokenBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);

    useEffect(() => {
        const rehydrate = async () => {
            if (typeof window === 'undefined') return;
            if (!publicKey) {
                setMintAddress(null);
                setTokenBalance(null);
                setMintList([]);
                return;
            }

            try {
                const listKey = `mints:${publicKey.toBase58()}`;
                const listRaw = window.localStorage.getItem(listKey);
                if (listRaw) {
                    const parsed: { mints: string[]; activeMint?: string } = JSON.parse(listRaw);
                    const list = Array.isArray(parsed?.mints) ? parsed.mints : [];
                    setMintList(list);
                    const active = parsed.activeMint && list.includes(parsed.activeMint)
                        ? parsed.activeMint
                        : (list[0] ?? null);
                    if (!active) return;
                    setMintAddress(active);
                    const mintPubkey = new PublicKey(active);
                    const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);
                    const accountInfo = await getAccount(connection, ata);
                    setTokenBalance(Number(accountInfo.amount) / 1_000_000);
                    return;
                }

                const legacyKey = `mint:${publicKey.toBase58()}`;
                const legacyRaw = window.localStorage.getItem(legacyKey);
                if (!legacyRaw) return;
                const legacy: { mint: string } = JSON.parse(legacyRaw);
                if (!legacy?.mint) return;
                setMintList([legacy.mint]);
                setMintAddress(legacy.mint);
                const mintPubkey = new PublicKey(legacy.mint);
                const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);
                const accountInfo = await getAccount(connection, ata);
                setTokenBalance(Number(accountInfo.amount) / 1_000_000);
                try {
                    const storageKey = `mints:${publicKey.toBase58()}`;
                    window.localStorage.setItem(storageKey, JSON.stringify({ mints: [legacy.mint], activeMint: legacy.mint }));
                    window.localStorage.removeItem(legacyKey);
                } catch { }
            } catch { }
        };

        rehydrate();
    }, [publicKey, connection]);

    const handleCreateMint = async () => {
        if (!publicKey) {
            toast.error('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);

            const mintKeypair = Keypair.generate();
            const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
            const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);

            const tx = new Transaction();
            tx.add(SystemProgram.createAccount({
                fromPubkey: publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports: lamportsForMint,
                programId: TOKEN_PROGRAM_ID,
            }));
            tx.add(createInitializeMintInstruction(mintKeypair.publicKey, 6, publicKey, null));
            tx.add(createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mintKeypair.publicKey));
            tx.add(createMintToInstruction(mintKeypair.publicKey, ata, publicKey, 10_000_000));

            const signature = await sendTransaction(tx, connection, { signers: [mintKeypair] });
            const latest = await connection.getLatestBlockhash();
            await connection.confirmTransaction({ signature, ...latest });

            const newMint = mintKeypair.publicKey.toBase58();
            setMintAddress(newMint);

            const accountInfo = await getAccount(connection, ata);
            setTokenBalance(Number(accountInfo.amount) / 1_000_000);

            try {
                if (typeof window !== 'undefined' && publicKey) {
                    const storageKey = `mints:${publicKey.toBase58()}`;
                    const existingRaw = window.localStorage.getItem(storageKey);
                    const existing: { mints: string[]; activeMint?: string } | null = existingRaw ? JSON.parse(existingRaw) : null;
                    const updatedList = Array.from(new Set([newMint, ...(existing?.mints ?? [])]));
                    setMintList(updatedList);
                    window.localStorage.setItem(storageKey, JSON.stringify({ mints: updatedList, activeMint: newMint }));
                }
            } catch { }

            toast.success('Token minted successfully');
        } catch {
            toast.error('Failed to create and mint token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-full w-full bg-surface border border-border rounded-xl overflow-hidden'>
            <div className='px-5 pt-4 pb-1'>
                <p className='text-[10px] tracking-widest uppercase text-muted font-bold'>Create & Mint SPL Token</p>
            </div>

            <div className='px-5 py-4 flex flex-col gap-4'>
                <button
                    onClick={handleCreateMint}
                    disabled={!publicKey || loading}
                    className='w-full bg-accent rounded-lg px-4 py-3 text-xs font-bold tracking-wider uppercase text-white cursor-pointer hover:bg-[#bc4f1f] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    {loading ? 'Minting...' : 'Create & Mint'}
                </button>

                {mintAddress && (
                    <div className='bg-surface-2 border border-border rounded-xl overflow-hidden'>
                        <div className='px-4 py-3 flex items-center justify-between border-b border-border'>
                            <div className='flex items-center gap-2'>
                                <div className='w-1.5 h-1.5 rounded-full bg-success'></div>
                                <span className='text-[10px] tracking-widest uppercase text-muted font-bold'>Active Token</span>
                            </div>
                            {tokenBalance !== null && (
                                <span className='text-xs font-bold text-success'>
                                    {tokenBalance} <span className='text-muted font-normal'>tokens</span>
                                </span>
                            )}
                        </div>

                        <div className='px-4 py-3 flex flex-col gap-3'>
                            <p className='font-mono text-xs text-muted break-all leading-relaxed'>{mintAddress}</p>

                            <div className='flex flex-wrap gap-2'>
                                <button
                                    onClick={() => {
                                        if (!mintAddress) return;
                                        navigator.clipboard.writeText(mintAddress);
                                        toast.success('Mint address copied');
                                    }}
                                    className='text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-muted transition-colors duration-150 cursor-pointer'
                                >
                                    Copy
                                </button>
                                <a
                                    href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-muted transition-colors duration-150'
                                >
                                    Explorer ↗
                                </a>
                                {mintList.length > 1 && (
                                    <button
                                        onClick={() => setShowAllModal(true)}
                                        className='text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-muted transition-colors duration-150 cursor-pointer'
                                    >
                                        All ({mintList.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showAllModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4' style={{ backdropFilter: 'blur(4px)' }}>
                    <div className='w-full max-w-lg bg-surface border border-border rounded-2xl max-h-[80vh] flex flex-col overflow-hidden'>
                        <div className='px-5 py-4 flex items-center justify-between border-b border-border flex-shrink-0'>
                            <div>
                                <p className='text-[10px] tracking-widest uppercase text-muted font-bold'>Mint History</p>
                                <p className='text-xs text-muted mt-0.5'>{mintList.length} token{mintList.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button
                                onClick={() => setShowAllModal(false)}
                                className='w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-muted transition-colors duration-150 cursor-pointer text-sm'
                            >
                                ✕
                            </button>
                        </div>

                        {mintList.length === 0 ? (
                            <div className='flex-1 flex items-center justify-center py-8'>
                                <p className='text-sm text-muted'>No mints found</p>
                            </div>
                        ) : (
                            <div className='flex flex-col overflow-auto flex-1 min-h-0 p-3 gap-2'>
                                {mintList.map((m, idx) => {
                                    const isActive = m === mintAddress;
                                    return (
                                        <div
                                            key={m}
                                            className={`rounded-xl p-3 border transition-colors duration-150 ${isActive ? 'bg-surface-2 border-accent/30' : 'bg-surface-2 border-border'}`}
                                        >
                                            <div className='flex items-center justify-between mb-2'>
                                                <div className='flex items-center gap-2'>
                                                    {isActive
                                                        ? <span className='text-[9px] font-bold tracking-widest uppercase text-accent bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full'>Active</span>
                                                        : <span className='text-[9px] font-bold tracking-widest uppercase text-muted bg-surface border border-border px-2 py-0.5 rounded-full'>#{idx + 1}</span>
                                                    }
                                                </div>
                                                <div className='flex items-center gap-1.5'>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(m); toast.success('Copied'); }}
                                                        className='text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-muted transition-colors duration-150 cursor-pointer'
                                                    >
                                                        Copy
                                                    </button>
                                                    <a
                                                        href={`https://explorer.solana.com/address/${m}?cluster=devnet`}
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        className='text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-muted transition-colors duration-150'
                                                    >
                                                        ↗
                                                    </a>
                                                    {!isActive && (
                                                        <button
                                                            onClick={async () => {
                                                                setMintAddress(m);
                                                                try {
                                                                    if (typeof window !== 'undefined' && publicKey) {
                                                                        const storageKey = `mints:${publicKey.toBase58()}`;
                                                                        const existingRaw = window.localStorage.getItem(storageKey);
                                                                        const existing: { mints: string[] } | null = existingRaw ? JSON.parse(existingRaw) : null;
                                                                        const mints = existing?.mints ?? mintList;
                                                                        window.localStorage.setItem(storageKey, JSON.stringify({ mints, activeMint: m }));
                                                                    }
                                                                } catch { }
                                                                try {
                                                                    const ata = await getAssociatedTokenAddress(new PublicKey(m), publicKey!);
                                                                    const accountInfo = await getAccount(connection, ata);
                                                                    setTokenBalance(Number(accountInfo.amount) / 1_000_000);
                                                                } catch {
                                                                    setTokenBalance(0);
                                                                }
                                                                setShowAllModal(false);
                                                            }}
                                                            className='text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-white hover:bg-[#bc4f1f] transition-colors duration-150 cursor-pointer'
                                                        >
                                                            Set Active
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className='font-mono text-[11px] text-muted'>
                                                {m.slice(0, 8)}...{m.slice(-8)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
