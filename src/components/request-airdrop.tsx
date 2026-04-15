'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RequestAirdrop() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [airdropAttempted, setAirdropAttempted] = useState(false);
  const [amount, setAmount] = useState(1);

  async function airdropSol() {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }
    if (airdropAttempted) {
      toast.error('Airdrop already attempted today. Try again tomorrow!');
      return;
    }
    setLoading(true);
    setAirdropAttempted(true);
    try {
      await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
      toast.success(`Airdropped ${amount} SOL successfully!`);
    } catch {
      toast.error('Airdrop limit reached. Try again tomorrow!');
    } finally {
      setLoading(false);
      setAmount(1);
    }
  }

  return (
    <div className='h-full w-full bg-surface border border-border rounded-xl overflow-hidden'>
      <div className='px-5 pt-4 pb-1'>
        <p className='text-[10px] tracking-widest uppercase text-muted font-bold'>Request Airdrop</p>
      </div>

      <div className='px-5 py-4 flex flex-col gap-3'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='airdrop-amount' className='text-xs text-muted'>
            Amount (SOL)
          </label>
          <input
            type='number'
            id='airdrop-amount'
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder='1'
            className='w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-accent/60 transition-colors duration-150'
            required
          />
        </div>
        <button
          onClick={airdropSol}
          disabled={!publicKey || loading}
          className='w-full bg-accent rounded-lg px-4 py-3 text-xs font-bold tracking-wider uppercase text-white cursor-pointer hover:bg-[#bc4f1f] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
        >
          {loading ? 'Processing...' : 'Request Airdrop'}
        </button>
      </div>
    </div>
  );
}
