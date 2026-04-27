# 🛡️ Aegis Will — Digital Legacy on Blockchain

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run dev server
```bash
npm run dev
```
Opens at http://localhost:3000

### 3. Connect MetaMask
Click "Connect Wallet" → select MetaMask → approve.

### 4. Deploy contract via Remix
1. Go to https://remix.ethereum.org
2. Create AegisWill.sol, paste the contract code from /contracts/
3. Compile with Solidity 0.8.20
4. Set Environment → "Injected Provider - MetaMask"
5. Constructor args: name (string), inactivityDays (uint256 e.g. 365)
6. Deploy → copy the address
7. Paste in Dashboard → "Link Contract"

### 5. Build for production
```bash
npm run build
```

## Supported Networks
- Ethereum Mainnet
- Sepolia Testnet (recommended for testing)
- Polygon, BSC, Avalanche
