# RouteX (Function Selector Router)

A modular EVM function routing system inspired by EIP-2535 diamonds. Incoming calls to a single proxy entrypoint (`FunctionDispatcher.sol`) are dynamically forwarded to registered facet implementations (`MockToken.sol`, `MockCalc.sol`) using inline-assembly `delegatecall`.

Live Demo: [func-selector.vercel.app](https://func-selector.vercel.app)

---

## Repository Structure

- [`/contract`](./contract): Foundry project with Solidity contracts, unit/invariant tests, and Sepolia deployment scripts.
- [`/frontend`](./frontend): Next.js 14 Web3 interface for calldata assembly, facet execution, and route management.

---

## Architecture Overview

```
User / dApp
    │ (calldata)
    ▼
FunctionDispatcher.sol  ─── queries ───►  FunctionRegistry.sol (O(1) storage)
    │
    ▼ (delegatecall with msg.data)
Facet Implementation (e.g. MockToken.sol / MockCalc.sol)
```

---

## Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| **FunctionDispatcher** | `0x4bf0170e56452a3f02afeb84554b0ae5d26c6349` |
| **FunctionRegistry** | `0x54254040faf67f85e96617d3ec600248c4b3ad37` |
| **MockCalc** | `0x5dfd8159f5c72c582d9871fd62100b115d25290e` |
| **MockToken** | `0xf2087c6561224ca85d9e98028cf7d075640f3b11` |

---

## Quick Start

### Contracts (Foundry)

```bash
cd contract
forge build
forge test
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
