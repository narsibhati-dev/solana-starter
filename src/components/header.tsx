import ConnectWallet from './connect-wallet';

export default function Header() {
  return (
    <header className='flex items-center justify-between px-5 py-3 mt-3 bg-surface border border-border rounded-xl'>
      <div className='flex items-center gap-3'>
        <h1 className='font-display text-3xl lg:text-4xl text-foreground'>
          SOLANA STARTER
        </h1>
        <span className='text-[9px] font-bold tracking-widest uppercase text-accent bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full leading-none'>
          DEVNET
        </span>
      </div>
      <ConnectWallet />
    </header>
  );
}
