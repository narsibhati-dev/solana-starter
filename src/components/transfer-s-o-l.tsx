'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
} from '@solana/web3.js';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function TransferSOL() {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [txSig, setTxSig] = useState<string | null>(null);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) return;

        try {
            setLoading(true);

            const recipientPubKey = new PublicKey(recipient);
            const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPubKey,
                    lamports,
                }),
            );

            const signature = await sendTransaction(transaction, connection);
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({ signature, ...latestBlockhash });

            toast.success(`Sent ${amount} SOL`);
            setTxSig(signature);
        } catch {
            toast.error('Transfer failed. Check the address and balance.');
        } finally {
            setLoading(false);
            setRecipient('');
            setAmount('');
        }
    };

    return (
        <div className='h-full w-full bg-surface border border-border rounded-xl overflow-hidden'>
            <div className='px-5 pt-4 pb-1'>
                <p className='text-[10px] tracking-widest uppercase text-muted font-bold'>Transfer SOL</p>
            </div>

            <div className='px-5 py-4'>
                <form onSubmit={handleTransfer} className='flex flex-col gap-3'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='recipient' className='text-xs text-muted'>
                            Recipient Address
                        </label>
                        <input
                            type='text'
                            id='recipient'
                            placeholder='Enter address'
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            className='w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-accent/60 transition-colors duration-150'
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='sol-amount' className='text-xs text-muted'>
                            Amount (SOL)
                        </label>
                        <input
                            type='number'
                            id='sol-amount'
                            placeholder='0.00'
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className='w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-accent/60 transition-colors duration-150'
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={!publicKey || loading}
                        className='w-full bg-accent rounded-lg px-4 py-3 text-xs font-bold tracking-wider uppercase text-white cursor-pointer hover:bg-[#bc4f1f] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </form>

                {txSig && (
                    <div className='mt-4 bg-surface-2 rounded-lg px-4 py-3'>
                        <p className='text-[10px] tracking-widest uppercase text-muted mb-1.5'>Transaction</p>
                        <a
                            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                            target='_blank'
                            rel='noreferrer'
                            className='text-xs text-accent hover:text-[#bc4f1f] underline underline-offset-4 break-all transition-colors duration-150'
                        >
                            {txSig.slice(0, 20)}...{txSig.slice(-8)} ↗
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
