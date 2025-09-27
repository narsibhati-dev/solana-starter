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

    // rehydrate from localStorage when wallet connects
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
                // Prefer multi-mint storage
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
                    const balance = Number(accountInfo.amount) / 1_000_000; // decimals 6
                    setTokenBalance(balance);
                    return;
                }

                // Fallback (and migrate) from legacy single-mint key
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
                const balance = Number(accountInfo.amount) / 1_000_000; // decimals 6
                setTokenBalance(balance);
                // migrate
                try {
                    const storageKey = `mints:${publicKey.toBase58()}`;
                    window.localStorage.setItem(storageKey, JSON.stringify({ mints: [legacy.mint], activeMint: legacy.mint }));
                    window.localStorage.removeItem(legacyKey);
                } catch { }
            } catch {
                // ignore rehydrate errors
            }
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

            // Generate a new keypair for the mint account (will sign creation)
            const mintKeypair = Keypair.generate();

            // Compute rent-exempt lamports for the mint account
            const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

            // Derive the associated token account (ATA) for the connected wallet
            const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);

            // Build transaction with: create mint account, init mint, create ATA, mint to ATA
            const tx = new Transaction();

            // 1) Create the mint account (payer: connected wallet)
            tx.add(
                SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: MINT_SIZE,
                    lamports: lamportsForMint,
                    programId: TOKEN_PROGRAM_ID,
                })
            );

            // 2) Initialize the mint (decimals=6, mint authority = connected wallet)
            tx.add(
                createInitializeMintInstruction(
                    mintKeypair.publicKey,
                    6,
                    publicKey,
                    null
                )
            );

            // 3) Create the ATA for the connected wallet
            tx.add(
                createAssociatedTokenAccountInstruction(
                    publicKey, // payer
                    ata,       // ATA address
                    publicKey, // owner
                    mintKeypair.publicKey
                )
            );

            // 4) Mint 10 tokens (10_000_000 units for 6 decimals) to ATA
            tx.add(
                createMintToInstruction(
                    mintKeypair.publicKey,
                    ata,
                    publicKey, // mint authority
                    10_000_000
                )
            );

            // Send and confirm
            const signature = await sendTransaction(tx, connection, { signers: [mintKeypair] });
            const latest = await connection.getLatestBlockhash();
            await connection.confirmTransaction({ signature, ...latest });

            const newMint = mintKeypair.publicKey.toBase58();
            setMintAddress(newMint);

            // Fetch token balance from the ATA
            const accountInfo = await getAccount(connection, ata);
            const balance = Number(accountInfo.amount) / 1_000_000;
            setTokenBalance(balance);

            // persist mint list with active
            try {
                if (typeof window !== 'undefined' && publicKey) {
                    const storageKey = `mints:${publicKey.toBase58()}`;
                    const existingRaw = window.localStorage.getItem(storageKey);
                    const existing: { mints: string[]; activeMint?: string } | null = existingRaw ? JSON.parse(existingRaw) : null;
                    const existingList = existing?.mints ?? [];
                    const updatedList = Array.from(new Set([newMint, ...existingList]));
                    setMintList(updatedList);
                    window.localStorage.setItem(storageKey, JSON.stringify({ mints: updatedList, activeMint: newMint }));
                }
            } catch {
                // ignore storage errors
            }
            toast.success('Token minted successfully');
        } catch {
            toast.error('Failed to create and mint token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full rounded-lg bg-white/10 p-3 sm:p-4 shadow-lg ring ring-neutral-700">
            <h3 className="text-center text-base sm:text-lg font-bold text-purple-300">
                Create & Mint SPL Token
            </h3>

            <button
                onClick={handleCreateMint}
                disabled={!publicKey || loading}
                className="mt-4 w-full rounded-md bg-gradient-to-r from-purple-300 to-purple-200 px-3 sm:px-4 py-2 font-bold text-black shadow-lg transition duration-200 cursor-pointer hover:scale-101 disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base"
            >
                {loading ? 'Minting...' : 'Create & Mint'}
            </button>

            {mintAddress && (
                <div className="mt-3 flex flex-col gap-4 sm:gap-6 bg-white/4 p-3 sm:p-4 rounded-lg">
                    <div className="break-all">
                        <p className="text-xs sm:text-sm text-purple-300">
                            <span className="font-semibold">Token Mint Address</span>
                        </p>
                        <p className="text-xs sm:text-sm text-purple-200 font-mono mt-1">
                            {mintAddress}
                        </p>
                    </div>

                    {/* Button group - responsive layout */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    if (!mintAddress) return;
                                    navigator.clipboard.writeText(mintAddress);
                                    toast.success('Mint address copied');
                                }}
                                className="cursor-pointer rounded-md bg-gradient-to-r from-purple-300 to-purple-200 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-black shadow-lg transition duration-200 hover:scale-102 flex-shrink-0"
                            >
                                Copy
                            </button>
                            <a
                                href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md bg-white/5 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-purple-200 underline decoration-purple-300/60 underline-offset-2 hover:decoration-purple-200 flex-shrink-0"
                            >
                                <span className="hidden sm:inline">View on Explorer</span>
                                <span className="sm:hidden">Explorer</span>
                            </a>
                            {mintList.length > 1 && (
                                <button
                                    onClick={() => setShowAllModal(true)}
                                    className="cursor-pointer rounded-md bg-white/5 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-purple-200 hover:bg-white/10 flex-shrink-0"
                                >
                                    <span className="hidden sm:inline">Show all ({mintList.length})</span>
                                    <span className="sm:hidden">All ({mintList.length})</span>
                                </button>
                            )}
                        </div>
                        {tokenBalance !== null && (
                            <div className="flex-shrink-0">
                                <p className="text-xs sm:text-sm font-semibold bg-white/5 rounded-md px-2 sm:px-3 py-1 text-green-300 inline-block">
                                    Balance: {tokenBalance} tokens
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAllModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-4xl rounded-lg bg-zinc-900 p-3 sm:p-4 shadow-xl max-h-[90vh] flex flex-col">
                        <div className="mb-2 flex items-center justify-between flex-shrink-0">
                            <h4 className="text-sm sm:text-base font-semibold text-purple-200">Your Mints</h4>
                            <button
                                onClick={() => setShowAllModal(false)}
                                className="rounded-md bg-white/5 px-2 py-1 text-xs text-purple-200 hover:bg-white/10"
                            >
                                Close
                            </button>
                        </div>
                        {mintList.length === 0 ? (
                            <p className="text-sm text-purple-200/70">No mints found.</p>
                        ) : (
                            <div className="flex flex-col gap-2 overflow-auto flex-1 min-h-0">
                                {mintList.map(m => {
                                    const isActive = m === mintAddress;
                                    return (
                                        <div key={m} className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-md p-2 sm:p-3 gap-2 sm:gap-0 ${isActive ? 'bg-white/10' : 'bg-white/5'}`}>
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-purple-200 flex-shrink-0">{isActive ? 'Active' : 'Mint'}</span>
                                                <span className="font-mono text-xs text-purple-200 break-all sm:break-normal">
                                                    <span className="hidden sm:inline">{m.slice(0, 8)}...{m.slice(-8)}</span>
                                                    <span className="sm:hidden">{m.slice(0, 6)}...{m.slice(-6)}</span>
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(m);
                                                        toast.success('Copied mint');
                                                    }}
                                                    className="rounded-md bg-gradient-to-r from-purple-300 to-purple-200 px-2 py-1 text-xs font-semibold text-black hover:scale-102 flex-shrink-0"
                                                >
                                                    Copy
                                                </button>
                                                <a
                                                    href={`https://explorer.solana.com/address/${m}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-md bg-white/5 px-2 py-1 text-xs font-semibold text-purple-200 underline underline-offset-2 hover:bg-white/10 flex-shrink-0"
                                                >
                                                    Explorer
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
                                                                const bal = Number(accountInfo.amount) / 1_000_000;
                                                                setTokenBalance(bal);
                                                            } catch {
                                                                setTokenBalance(0);
                                                            }
                                                            setShowAllModal(false);
                                                        }}
                                                        className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-purple-200 hover:bg-white/20 flex-shrink-0"
                                                    >
                                                        Set Active
                                                    </button>
                                                )}
                                            </div>
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