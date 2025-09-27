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

            toast.success(`Transfer successful of ${amount}`);
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
        <div className='h-full w-full rounded-lg bg-white/10 p-4 shadow-lg ring ring-neutral-700'>
            <h3 className='text-center text-lg font-bold text-purple-300'>
                Transfer SOL
            </h3>

            <form onSubmit={handleTransfer} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <label htmlFor='recipient'>Recipient Address</label>
                    <input
                        type='text'
                        id='recipient'
                        placeholder='Recipient Address'
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        className='w-full rounded-md bg-white/5 p-2 text-white outline-none'
                        required
                    />
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor='amount'>Amount in SOL</label>
                    <input
                        type='number'
                        id='amount'
                        placeholder='Amount in SOL'
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className='w-full rounded-md bg-white/5 p-2 text-white outline-none'
                        required
                    />
                </div>
                <button
                    type='submit'
                    disabled={!publicKey || loading}
                    className='w-full rounded-md bg-gradient-to-r from-purple-300 to-purple-200 px-4 py-2 font-bold text-black shadow-lg transition duration-200 hover:scale-101 disabled:cursor-not-allowed disabled:opacity-50 ease-in-out'
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>

            {txSig && (
                <a
                    href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                    target='_blank'
                    rel='noreferrer'
                    className='text-sm text-purple-300 underline'
                >
                    View Transaction
                </a>
            )}
        </div>
    );
}
