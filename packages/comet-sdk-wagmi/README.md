# @woof-software/comet-sdk-wagmi

## Description <a href="#description" id="description"></a>

**comet-sdk-wagmi** is a TypeScript library that extends `@woof-software/comet-sdk` with wagmi/viem-powered contract wrappers, fetchers, and utilities. It enables seamless, type-safe interaction with Comet protocol entities and DeFi analytics in modern React/TypeScript dApps, supporting multicall, user/market analytics, and high-level DeFi operations.

* **Wagmi-based contract wrappers** for Comet, ERC20, Bulker, ConfigController, and more
* **Augmented fetchers** for user, market, collateral, and protocol data (multichain-ready)
* **Type-safe, composable classes** for all protocol entities
* **High-level wrappers** for user and admin operations (supply, borrow, approve, migrate, etc.)
* **Utility functions** for formatting, multicall, and address management
* **Full compatibility** with `@wagmi/core`, `viem`, `@woof-software/comet-sdk`, and `@woof-software/subgraph-sdk`

## 📦 Installation

Before installing this package, make sure you have the following **peer dependencies** installed:

```bash
pnpm add \
  @woof-software/comet-sdk \
  @woof-software/subgraph-sdk \
  @wagmi/core \
  viem
```
Then:

`pnpm add @woof-software/comet-sdk-wagmi`

## Quickstart <a href="#quickstart" id="quickstart"></a>

### Configure wagmi <a href="#id-1-configure-wagmi" id="id-1-configure-wagmi"></a>

```ts
import { createConfig, http } from "@wagmi/core";
import { arbitrum, mainnet } from "@wagmi/core/chains";

const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
});
```

Or use the built-in config:

```ts
import { wagmiConfig } from "@woof-software/comet-sdk-wagmi";
```

### Fetch market data <a href="#id-2-fetch-market-data" id="id-2-fetch-market-data"></a>

```ts
import { Market } from "@woof-software/comet-sdk-wagmi";

const market = await Market.fetchMarket(
  "0xCometAddress",
  42161, // arbitrum.id
  wagmiConfig
);
console.log(market.supplyApr, market.borrowApr, market.availableLiquidity);
```

### Fetch user market data <a href="#id-3-fetch-user-market-data" id="id-3-fetch-user-market-data"></a>

```ts
import { UserMarket } from "@woof-software/comet-sdk-wagmi";

const userMarket = await UserMarket.fetchUserMarket(
  "0xCometAddress",
  "0xUserAddress",
  42161,
  wagmiConfig
);
console.log(userMarket.supplyBalance, userMarket.borrowBalance);
```

### Use high-level wrappers for operations <a href="#id-4-use-high-level-wrappers-for-operations" id="id-4-use-high-level-wrappers-for-operations"></a>

```ts
import { UserMarketWrapper } from "@woof-software/comet-sdk-wagmi";

const wrapper = new UserMarketWrapper(userMarket, wagmiConfig, 42161);

// Approve a token
await wrapper.approveToken("0xTokenAddress", "1.0", 18);

// Supply collateral
await wrapper.supplyCollaterals([
  { tokenAddress: "0xTokenAddress", inputAmount: "1.0" }
], 42161);
```

## Main Entities & API <a href="#main-entities--api" id="main-entities--api"></a>

### Augmented Entities <a href="#augmented-entities" id="augmented-entities"></a>

* **Base, Curve, Collateral, Market, User, UserMarket, SandboxController, ConfigController**
* Each class extends the base SDK with wagmi-powered fetchers and helpers.

**Example: Market**

```ts
import { Market } from "@woof-software/comet-sdk-wagmi";

const market = await Market.fetchMarket("0xCometAddress", 42161, wagmiConfig);
console.log(market.totalSupplyUSD, market.utilizationPercent);
```

**Example: UserMarket**

```ts
import { UserMarket } from "@woof-software/comet-sdk-wagmi";

const userMarket = await UserMarket.fetchUserMarket("0xCometAddress", "0xUserAddress", 42161, wagmiConfig);
console.log(userMarket.supplyBalanceUSD, userMarket.borrowBalanceUSD);
```

### Contract Wrappers <a href="#contract-wrappers" id="contract-wrappers"></a>

* **CometContract, Erc20Contract, BulkerContract, ConfigControllerContract, ControllerContract, MigratorContract**
* All inherit from `WagmiContract` (provides `read`, `write`, multicall, calldata helpers).

**Example: Direct contract call**

```ts
import { CometContract } from "@woof-software/comet-sdk-wagmi";

const comet = new CometContract("0xCometAddress", 42161, wagmiConfig);
const utilization = await comet.read("getUtilization");
```

### High-level Wrappers <a href="#high-level-wrappers" id="high-level-wrappers"></a>

* **UserMarketWrapper, ConfigControllerWrapper, SandboxControllerWrapper**
* Simplify user and admin operations (supply, borrow, approve, migrate, etc.)

**Example: UserMarketWrapper**

```ts
import { UserMarketWrapper } from "@woof-software/comet-sdk-wagmi";

const wrapper = new UserMarketWrapper(userMarket, wagmiConfig, 42161);
await wrapper.approveToken("0xTokenAddress", "0.01", 18);
await wrapper.supplyCollaterals([{ tokenAddress: "0xTokenAddress", inputAmount: "0.01" }], 42161);
```

### Fetchers <a href="#fetchers" id="fetchers"></a>

* `fetchMarket`, `fetchMarkets`, `fetchUserMarket`, `fetchUserMarkets`, `fetchUserCollaterals`, `fetchBase`, etc.
* All use wagmi multicall and return fully-typed objects.

**Example: Fetching multiple markets for a user**

```ts
import { UserMarket } from "@woof-software/comet-sdk-wagmi";
import { arbitrum, mainnet } from "@wagmi/core/chains";

const userMarkets = await UserMarket.fetchUserMarkets(
  {
    [arbitrum.id]: ["0x...", "0x..."],
    [mainnet.id]: ["0x..."],
  },
  "0xUserAddress",
  wagmiConfig
);
```

### Utilities <a href="#utilities" id="utilities"></a>

* **FormattingUtils** — formatting for numbers, tokens, percentages, addresses
* **WagmiUtils** — multicall result helper,  etc

```ts
import { FormattingUtils } from "@woof-software/comet-sdk-wagmi";

console.log(FormattingUtils.formatTokenValue(1234567890123456789n, 18)); // "1.234567890123456789"
```

### Config & ABI <a href="#config--abi" id="config--abi"></a>

* All contract ABIs exported
* Chain, address, and subgraph config exports

## API Structure <a href="#api-structure" id="api-structure"></a>

* `@woof-software/comet-sdk-wagmi/augment` — augmented entities and fetchers
* `@woof-software/comet-sdk-wagmi/contracts` — contract wrappers
* `@woof-software/comet-sdk-wagmi/wrappers` — high-level operation wrappers
* `@woof-software/comet-sdk-wagmi/utils` — utilities
* `@woof-software/comet-sdk-wagmi/config` — addresses, chains, subgraph URLs
* `@woof-software/comet-sdk-wagmi/abis` — all supported contract ABIs

