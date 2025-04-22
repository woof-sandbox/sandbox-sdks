# @sandbox/comet-sdk-wagmi

A wagmi-powered extension of [`@sandbox/comet-sdk`](https://www.npmjs.com/package/@sandbox/comet-sdk) that provides utilities, fetchers, and wrappers to simplify working with Comet markets and users using wagmi-compatible tools.

---

## ✨ Features

- `Wrapper` classes with wagmi-based logic
- Augmented fetchers (`fetchUserMarket`, `fetchUserMarkets`, etc.)
- Type-safe and ready for multi-market interactions
- Fully compatible with `viem` and `@wagmi/core`

---

## 📦 Installation

Before installing this package, make sure you have the following **peer dependencies** installed:

```bash
pnpm add \
  @sandbox/comet-sdk \
  @sandbox/subgraph-sdk \
  @wagmi/core \
  viem
```
Then:

`pnpm add @sandbox/comet-sdk-wagmi`

