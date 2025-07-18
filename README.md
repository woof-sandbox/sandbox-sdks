# sandbox-sdks

TypeScript monorepo for DeFi, Comet protocol, and subgraph analytics. This workspace provides SDKs for smart contract interaction, DeFi analytics, multicall batching, and integration with wagmi/viem and The Graph. All packages are written in TypeScript and support composability and type safety for dApp development.

---

## Table of Contents
- [Packages](#packages)
- [Installation](#installation)
- [Workspace Structure](#workspace-structure)
- [Testing](#testing)
---

## Packages

| Package | Description |
|---------|-------------|
| [`@woof-software/comet-sdk`](./packages/comet-sdk/README.md) | TypeScript SDK for Comet protocol entities, DeFi analytics, and classes (Market, User, Token, Curve, etc.). |
| [`@woof-software/comet-sdk-wagmi`](./packages/comet-sdk-wagmi/README.md) | Wagmi/viem-based contract wrappers, fetchers, and utilities for Comet protocol. Enables type-safe, multicall-ready DeFi dApps in React/TypeScript. |
| [`@woof-software/contracts-tools-sdk-ethers`](./packages/contracts-tools-sdk-ethers/README.md) | Ethers.js-based toolkit for smart contract interaction, multicall3 batching, and contract abstraction. |
| [`@woof-software/subgraph-sdk`](./packages/subgraph-sdk/README.md) | SDK for querying The Graph subgraphs with pagination, helpers, and type-safe utilities. |
| [`test-sdk`](./packages/test-sdk/) | Example/test React app for SDK integration and local development. |

---

## Installation

Clone the repo and install all dependencies:

```bash
pnpm install
```

Each package can also be installed individually (see their READMEs for peer dependencies):

```bash
pnpm add @woof-software/comet-sdk
pnpm add @woof-software/comet-sdk-wagmi
pnpm add @woof-software/contracts-tools-sdk-ethers
pnpm add @woof-software/subgraph-sdk
```

---

## Workspace Structure

```
sandbox-sdks/
  packages/
    comet-sdk/                # Protocol analytics and entities
    comet-sdk-wagmi/          # Wagmi/viem-based contract wrappers and fetchers
    contracts-tools-sdk-ethers/ # Ethers.js contract/multicall toolkit
    subgraph-sdk/             # Subgraph querying utilities
    test-sdk/                 # Example/test React app
  scripts/                    # Build, lint, and utility scripts
  README.md                   # This file
  pnpm-workspace.yaml         # Monorepo config
```

---

## Package Summaries

### [`@woof-software/comet-sdk`](./packages/comet-sdk/README.md)
- Classes: Market, User, UserMarket, Token, Curve
- DeFi analytics: TVL, APR, utilization, collateralization, etc.
- Utility methods for calculations, analytics, and UI integrations
- TypeScript types and JSDoc

### [`@woof-software/comet-sdk-wagmi`](./packages/comet-sdk-wagmi/README.md)
- Wagmi/viem contract wrappers for Comet, ERC20, Bulker, ConfigController, etc.
- Fetchers for user, market, collateral, protocol data (multichain support)
- Wrappers for user/admin operations (supply, borrow, approve, migrate)
- Utilities for formatting, multicall, address management
- Compatible with wagmi, viem, comet-sdk, subgraph-sdk

### [`@woof-software/contracts-tools-sdk-ethers`](./packages/contracts-tools-sdk-ethers/README.md)
- BaseContract: ethers.js contract abstraction
- MulticallUnit: batch static/mutable calls with multicall3
- Helpers for transactions, signal-based cancellation, and utilities
- Configurable options for batching, timeouts, etc.

### [`@woof-software/subgraph-sdk`](./packages/subgraph-sdk/README.md)
- fetchSingle/fetchCollection: query The Graph subgraphs with pagination
- Helpers for where clauses, headers, and pagination
- Type-safe utilities

### [`test-sdk`](./packages/test-sdk/)
- Example React app for local development and integration testing
- Vite + React + TypeScript
- Demonstrates usage of all SDKs in a dApp context

---

## Testing

Each package provides its own test configuration and scripts:

- `test` - default (unit)
- `test:unit` - unit tests for individual functions
- `test:e2e` - tests that may involve external dependencies (e.g. RPC, contracts)
- `test:local` - tests for local dev environments (e.g., mocks or anvil-based tests)
- `test:all` - run all tests
---
