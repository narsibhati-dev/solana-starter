import ConnectWallet from './connect-wallet';

export default function Header() {
  return (
    <header className='flex items-center justify-between py-2 mt-2 px-4 bg-white/10 rounded-md text-neutral-200 ring ring-neutral-700'>
      <h1 className='text-base font-bold lg:text-2xl '>
        Solana Starter <span className='text-xs text-neutral-400'>Devnet</span>
      </h1>
      <ConnectWallet />
    </header>
  );
}
