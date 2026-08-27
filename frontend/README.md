# RouteX Frontend

A Web3 developer interface and calldata playground for the RouteX dynamic function dispatcher on Ethereum Sepolia.

---

## Features

- **Facet Studio**: Live on-chain interaction with registered facets (`MockToken` ERC-20 faucet/transfer and `MockCalc` pure arithmetic).
- **Route Registry**: Read and manage selector-to-implementation routes mapped in `FunctionRegistry.sol`.
- **Dispatcher Gateway**: Encode parameter inputs into raw calldata and dispatch transactions through `FunctionDispatcher.sol`.
- **Calldata Inspector**: Disassemble raw transaction payloads into 4-byte selectors and 32-byte words, with `eth_call` pre-flight simulation.
- **Security Auditor**: Detect 4-byte Keccak-256 selector collisions and verify facet address safety.
- **SDK Codegen**: Generate copy-paste integration snippets in Viem, Ethers.js (v6), and Solidity.
- **Selector Hasher**: Compute 4-byte function selectors from canonical Solidity signatures in real time.

---

## Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| **FunctionDispatcher** | `0x4bf0170e56452a3f02afeb84554b0ae5d26c6349` |
| **FunctionRegistry** | `0x54254040faf67f85e96617d3ec600248c4b3ad37` |
| **MockCalc** | `0x5dfd8159f5c72c582d9871fd62100b115d25290e` |
| **MockToken** | `0xf2087c6561224ca85d9e98028cf7d075640f3b11` |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Ethereum Libraries**: Viem v2 + Wagmi v2 + RainbowKit
- **Styling**: Tailwind CSS + Lucide Icons + Sonner

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables (optional)

Create a `.env.local` file if you want to override default contract addresses or RPCs:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS="0x54254040faf67f85e96617d3ec600248c4b3ad37"
NEXT_PUBLIC_DISPATCHER_ADDRESS="0x4bf0170e56452a3f02afeb84554b0ae5d26c6349"
NEXT_PUBLIC_MOCK_CALC_ADDRESS="0x5dfd8159f5c72c582d9871fd62100b115d25290e"
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS="0xf2087c6561224ca85d9e98028cf7d075640f3b11"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=""
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production build

```bash
npm run build
```
