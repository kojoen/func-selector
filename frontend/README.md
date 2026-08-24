# RouteX & Web3 SDK

A production-grade Web3 dashboard and interactive calldata playground for the **RouteX** smart contract architecture.

---

## ⚡ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Web3 Engine**: Viem v2 + Wagmi v2
- **Wallet Connection**: RainbowKit
- **UI / Styling**: Tailwind CSS + Lucide Icons + Sonner (Toast notifications)
- **Data Synchronization**: TanStack Query (React Query)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Configure your contract addresses:
- `NEXT_PUBLIC_REGISTRY_ADDRESS`: Address of deployed `FunctionRegistry.sol`
- `NEXT_PUBLIC_DISPATCHER_ADDRESS`: Address of deployed `FunctionDispatcher.sol`
- `NEXT_PUBLIC_MOCK_CALC_ADDRESS`: Address of deployed `MockCalc.sol`
- `NEXT_PUBLIC_MOCK_TOKEN_ADDRESS`: Address of deployed `MockToken.sol`

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🏛️ Core Features

1. **Live Routing Table (`RoutingTable.tsx`)**:
   - Queries all active selectors via `getAllSelectors()` and multicall.
   - Search by function signature, 4-byte selector hex, or target implementation address.
   - Owner actions: Register new route, Hot-swap implementation, or Unregister route.

2. **Dispatcher Playground (`DispatcherPlayground.tsx`)**:
   - Preset ABI parameter inputs for `MockCalc` and `MockToken`.
   - Real-time calldata assembly inspector.
   - Low-level `eth_call` simulation and fallback transaction dispatching.

3. **Selector Studio (`SelectorHasher.tsx`)**:
   - Live Keccak-256 function selector derivation and byte inspection.
