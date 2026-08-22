# Function Selector Project

A modular Solidity function selector router and low-level calldata dispatcher.

## Project Structure

```
function-selector/
└── contract/       # Foundry smart contract workspace
    ├── .agents/    # Agent skills (gitignored)
    ├── src/        # FunctionDispatcher, FunctionRegistry, SelectorLib, Mocks
    ├── test/       # Unit, Fuzz, and Invariant test suites (56/56 PASS)
    ├── script/     # SetupSelectorSystem.s.sol
    └── foundry.toml
```

## Quick Start

### Smart Contracts
```bash
cd contract
forge build
forge test
```

### Run Setup Script
```bash
cd contract
forge script script/SetupSelectorSystem.s.sol --rpc-url <RPC_URL> --broadcast
```
