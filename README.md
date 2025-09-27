# Solana Starter App

A comprehensive Next.js application for interacting with the Solana blockchain. This starter project provides essential Solana functionality including wallet connection, SOL transfers, token creation, and airdrop requests.

## 🚀 Features

- **Wallet Integration**: Connect with Phantom and other Solana wallets
- **SOL Transfers**: Send SOL between addresses
- **Token Management**: Create and mint SPL tokens
- **Airdrop Requests**: Request SOL airdrops on devnet
- **Real-time Balance**: Live wallet balance updates
- **Transaction History**: View transactions on Solana Explorer
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js
- **Wallet**: Solana Wallet Adapter
- **UI Components**: React Hot Toast for notifications
- **Package Manager**: Bun (recommended)

## 📦 Dependencies

### Core Dependencies

- `@solana/web3.js` - Solana JavaScript SDK
- `@solana/wallet-adapter-react` - React hooks for wallet integration
- `@solana/wallet-adapter-phantom` - Phantom wallet support
- `@solana/spl-token` - SPL token operations
- `react-hot-toast` - Toast notifications

### Development Dependencies

- `typescript` - TypeScript support
- `tailwindcss` - CSS framework
- `eslint` - Code linting
- `prettier` - Code formatting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Solana wallet (Phantom recommended)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd solana-starter
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SOLANA_ENDPOINT=https://api.devnet.solana.com
   ```

4. **Run the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Wallet Connection

1. Click the "Connect Wallet" button in the header
2. Select your preferred wallet (Phantom, Solflare, etc.)
3. Approve the connection in your wallet

### SOL Operations

- **View Balance**: Your SOL balance is displayed in real-time
- **Request Airdrop**: Get free SOL on devnet (1 SOL per day limit)
- **Transfer SOL**: Send SOL to any Solana address

### Token Operations

- **Create Token**: Generate a new SPL token with 6 decimals
- **Mint Tokens**: Automatically mint 10 tokens to your wallet
- **View Token Balance**: See your token holdings
- **Manage Multiple Tokens**: Switch between different tokens you've created

## 🔧 Configuration

### Solana Network

The app is configured to use Solana devnet by default. To change networks, update the `SOLANA_ENDPOINT` in your environment variables:

```env
# Devnet (default)
NEXT_PUBLIC_SOLANA_ENDPOINT=https://api.devnet.solana.com

# Mainnet
NEXT_PUBLIC_SOLANA_ENDPOINT=https://api.mainnet-beta.solana.com

# Testnet
NEXT_PUBLIC_SOLANA_ENDPOINT=https://api.testnet.solana.com
```

### Wallet Configuration

Supported wallets are configured in `src/components/providers.tsx`. You can add or remove wallets as needed.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with wallet providers
│   └── page.tsx            # Main page component
├── components/
│   ├── connect-wallet.tsx  # Wallet connection component
│   ├── create-and-mint-token.tsx  # Token creation and management
│   ├── header.tsx          # Navigation header
│   ├── providers.tsx       # Wallet and connection providers
│   ├── request-airdrop.tsx # SOL airdrop functionality
│   ├── transfer-s-o-l.tsx  # SOL transfer component
│   └── wallet-info.tsx     # Wallet balance and info display
├── config/
│   └── index.ts            # App configuration
└── styles/
    ├── globals.css         # Global styles
    └── wallet.css          # Wallet-specific styles
```

## 🧪 Development

### Available Scripts

```bash
# Development server with Turbopack
bun dev

# Build for production
bun run build

# Start production server
bun start

# Lint code
bun run lint

# Format code
bun run format
```

### Code Quality

- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Code formatting with Tailwind CSS plugin
- **TypeScript**: Strict type checking enabled

## 🔒 Security Notes

- This app is configured for **devnet** by default
- Never use mainnet private keys in development
- Always verify transaction details before signing
- Be cautious with airdrop requests (devnet only)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Learning Resources

- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Guide](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Program](https://spl.solana.com/token)
- [Next.js Documentation](https://nextjs.org/docs)

## 🐛 Troubleshooting

### Common Issues

**Wallet not connecting:**

- Ensure you have a Solana wallet installed
- Check that the wallet is unlocked
- Try refreshing the page

**Transaction failures:**

- Verify you have sufficient SOL for transaction fees
- Check that recipient addresses are valid
- Ensure you're on the correct network (devnet)

**Token creation errors:**

- Make sure you have enough SOL for account creation
- Verify the transaction was confirmed
- Check Solana Explorer for transaction details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Solana Labs for the excellent developer tools
- Next.js team for the amazing framework
- The Solana community for inspiration and support
