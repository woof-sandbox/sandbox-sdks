# sandbox-sdks

A modern TypeScript monorepo for DeFi, Comet protocol, and subgraph analytics. This workspace provides modular SDKs for smart contract interaction, DeFi analytics, multicall batching, and seamless integration with wagmi/viem and The Graph. All packages are designed for composability, type safety, and robust dApp development.

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
| [`@woof-software/comet-sdk`](./packages/comet-sdk/README.md) | Core TypeScript SDK for Comet protocol entities, DeFi analytics, and composable classes (Market, User, Token, Curve, etc.). |
| [`@woof-software/comet-sdk-wagmi`](./packages/comet-sdk-wagmi/README.md) | Wagmi/viem-powered contract wrappers, fetchers, and utilities for Comet protocol. Enables type-safe, multicall-ready DeFi dApps in React/TypeScript. |
| [`@woof-software/contracts-tools-sdk-ethers`](./packages/contracts-tools-sdk-ethers/README.md) | Advanced ethers.js-based toolkit for smart contract interaction, multicall3 batching, and contract abstraction. |
| [`@woof-software/subgraph-sdk`](./packages/subgraph-sdk/README.md) | Lightweight SDK for querying The Graph subgraphs with pagination, helpers, and type-safe utilities. |
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
    comet-sdk/                # Core protocol analytics and entities
    comet-sdk-wagmi/          # Wagmi/viem-powered contract wrappers and fetchers
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
- **Composable classes**: Market, User, UserMarket, Token, Curve
- **DeFi analytics**: TVL, APR, utilization, collateralization, etc.
- **Utility methods**: For calculations, analytics, and UI integrations
- **TypeScript-first**: All types and JSDoc provided

### [`@woof-software/comet-sdk-wagmi`](./packages/comet-sdk-wagmi/README.md)
- **Wagmi/viem contract wrappers**: For Comet, ERC20, Bulker, ConfigController, etc.
- **Augmented fetchers**: User, market, collateral, protocol data (multichain-ready)
- **High-level wrappers**: User/admin operations (supply, borrow, approve, migrate)
- **Utilities**: Formatting, multicall, address management
- **Full compatibility**: With wagmi, viem, comet-sdk, subgraph-sdk

### [`@woof-software/contracts-tools-sdk-ethers`](./packages/contracts-tools-sdk-ethers/README.md)
- **BaseContract**: Extended ethers.js contract abstraction
- **MulticallUnit**: Batch static/mutable calls with multicall3
- **Helpers**: Priority transactions, signal-based cancellation, type-rich utilities
- **Configurable**: Global and per-call options for batching, timeouts, etc.

### [`@woof-software/subgraph-sdk`](./packages/subgraph-sdk/README.md)
- **fetchSingle/fetchCollection**: Query The Graph subgraphs with pagination
- **Helpers**: for where clauses, headers, and pagination
- **Type-safe**: CollectionQueryFactory, CollectionCallback, etc.
- **Minimal overhead**: Designed for clarity and reusability

### [`test-sdk`](./packages/test-sdk/)
- **Example React app**: For local development and integration testing
- **Vite + React + TypeScript**
- **Showcases**: Usage of all SDKs in a real dApp context

---

## Testing

Each package provides its own test configuration and scripts:

- `test` - default (unit)
- `test:unit` - Fast, deterministic, isolated tests for individual functions
- `test:e2e` - Full-stack tests that may involve external dependencies (e.g. RPC, contracts)
- `test:local` - Special tests for local dev environments (e.g., mocks or anvil-based tests)
- `test:all` - Run all tests
---
