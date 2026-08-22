# Function Selector Project

A modular, high-performance Solidity function selector router and low-level calldata dispatcher powered by Foundry.

[![Foundry Tests](https://img.shields.io/badge/Foundry-56%2F56%20Passing-brightgreen.svg)](#test-suite-summary)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-orange.svg)](https://soliditylang.org/)

---

## 🏛️ Architecture Overview

```
                          ┌─────────────────────────────┐
                          │   Incoming Transaction      │
                          │   (msg.data, msg.value)     │
                          └──────────────┬──────────────┘
                                         │
                                         ▼
                          ┌─────────────────────────────┐
                          │     FunctionDispatcher      │
                          │  (Assembly Delegatecall)    │
                          └──────────────┬──────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │ Query Implementation via bytes4 sel     │
                    ▼                                         ▼
      ┌───────────────────────────┐             ┌───────────────────────────┐
      │     FunctionRegistry      │             │        SelectorLib        │
      │  - O(1) swap & pop array  │             │  - keccak256 hash pure    │
      │  - Enumerable selectors   │             │  - Calldata split / pack  │
      │  - Access-controlled      │             │  - Boundary validation    │
      └─────────────┬─────────────┘             └───────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│    MockCalc     │   │    MockToken    │
│  (add/sub/div)  │   │ (transfer/mint) │
└─────────────────┘   └─────────────────┘
```

## 📁 Project Structure

```
function-selector/
└── contract/
    ├── src/
    │   ├── interfaces/
    │   │   ├── IDispatcher.sol
    │   │   └── IFunctionRegistry.sol
    │   ├── mocks/
    │   │   ├── MockCalc.sol
    │   │   └── MockToken.sol
    │   ├── FunctionDispatcher.sol
    │   ├── FunctionRegistry.sol
    │   └── SelectorLib.sol
    ├── test/
    │   ├── FunctionSelector.t.sol           # Unit, Boundary & Fuzz tests
    │   └── FunctionSelectorInvariant.t.sol  # Stateful Invariant suites
    ├── script/
    │   └── SetupSelectorSystem.s.sol        # Deployment & Registry init
    └── foundry.toml
```

## 🚀 Quick Start

### Build Contracts
```bash
cd contract
forge build
```

### Run Tests
```bash
cd contract
forge test -vvv
```

### Run Setup Script
```bash
cd contract
forge script script/SetupSelectorSystem.s.sol --rpc-url <RPC_URL> --broadcast
```

## 🧪 Test Suite Summary

| Test Category | Target File | Test Cases | Status |
| :--- | :--- | :--- | :--- |
| **Unit & Boundary Tests** | `FunctionSelector.t.sol` | 48 tests | ✅ PASS |
| **Fuzz Tests** | `FunctionSelector.t.sol` | 4 tests (256+ runs) | ✅ PASS |
| **Invariant Suites** | `FunctionSelectorInvariant.t.sol` | 4 invariants (3,840 calls) | ✅ PASS |
| **Total** | | **56 / 56** | **100% PASS** |
