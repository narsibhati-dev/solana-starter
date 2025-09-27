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
    <div className='h-full w-full rounded-lg bg-white/10 p-4 shadow-lg ring ring-neutral-700'>
      <h3 className='mb-4 text-center text-lg font-bold text-purple-300'>
        Request Airdrop
      </h3>

      <form className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='amount'>Amount in SOL</label>
          <input
            type='number'
            id='amount'
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder='Enter amount in SOL'
            className='w-full rounded-md bg-white/5 p-2 text-white outline-none'
            required
          />
        </div>
        <button
          onClick={airdropSol}
          disabled={!publicKey || loading}
          className='w-full cursor-pointer rounded-md bg-gradient-to-r from-purple-300 to-purple-200 px-4 py-2 font-bold text-black shadow-lg transition duration-200 ease-in-out hover:scale-101 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {loading ? 'Processing...' : 'Request Airdrop'}
        </button>
      </form>
    </div>
  );
}
