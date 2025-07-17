# @woof-software/comet-sdk

## Description

**comet-sdk** is a lightweight TypeScript library designed to simplify interaction with Comet protocol entities and DeFi analytics. It provides composable classes (`Market`, `User`, `UserMarket`, `Token`, `Curve`) and utility methods for calculations, analytics, and UI integrations. All tools are compatible with TypeScript, and JSDoc is provided.


---

## 📦 Installation

```bash
pnpm add @woof-software/comet-sdk
```

## Quickstart <a href="#quickstart" id="quickstart"></a>

### Market Entity <a href="#market-entity" id="market-entity"></a>

```typescript
import { Market } from '@woof-software/comet-sdk';

const marketData = {/* ...IMarket object from API or subgraph... */};
const market = new Market(marketData);

console.log(market.totalSupplyUSD); // Total supply in USD
console.log(market.utilizationPercent); // Utilization %
console.log(market.interestRateChartData); // Interest rate model chart points
```

### User Entity <a href="#user-entity" id="user-entity"></a>

```typescript
import { User } from '@woof-software/comet-sdk';

const userData = {/* ...IUser object from API or subgraph... */};
const user = new User(userData);

console.log(user.address); // User address
console.log(user.borrowMarkets); // List of borrowed market addresses
```

### Token Entity <a href="#token-entity" id="token-entity"></a>

```typescript
import { Token } from '@woof-software/comet-sdk';

const tokenData = {/* ...IToken object from API or subgraph... */};
const token = new Token(tokenData);

console.log(token.symbol); // Token symbol
console.log(token.price); // Token price (string)
```

### Curve Entity <a href="#curve-entity" id="curve-entity"></a>

```typescript
import { Curve } from '@woof-software/comet-sdk';

const curveData = {/* ...ICurve object from API or subgraph... */};
const curve = new Curve(curveData);

console.log(curve.supplyKink); // Supply kink point
```

### Market Analytics & Methods <a href="#market-analytics--methods" id="market-analytics--methods"></a>

```typescript
import { MarketMethods } from '@woof-software/comet-sdk';

const apr = MarketMethods.calcApr(1000000000000000000n); // Calculate APR from rate
const tvl = MarketMethods.getTVL(1000n, baseToken, collaterals); // Calculate TVL
const utilization = MarketMethods.getUtilization(500000000000000000n); // Utilization %
```

## Market <a href="#market" id="market"></a>

### **Description**

**Market** is a core class representing a Comet market. It provides analytics, derived properties, and access to market data.

### **Fields**

```typescript
constructor(marketData: IMarket)
```

* `.chain` // Chain ID
* `.cometAddress` // Market contract address
* `.utilization` // Utilization (bigint)
* `.supplyRate` // Supply rate (bigint)
* `.borrowRate` // Borrow rate (bigint)
* `.borrowMinAmount` // Total market reserves (bigint)
* `.totalSupply` // Total supply (bigint)
* `.totalBorrow` // Total borrow (bigint)
* `.totalReserves` // Total Reserves (bigint)
* `.baseToken` // Base token entity
* `.collaterals` // Array of collateral tokens
* `.availableLiquidity` // Available liquidity (bigint)
* `.configControllerAddress` // Configuration controller address
* `.ownerAddress` // Market owner address
* `.guardianAddress` // Guardian address
* `.curatorAddress` // Curator address
* `.curatorFee` // Curator fee (number)
* `.proposals` // Array of market proposals
* `.compToken` // COMP token entity
* `.rewardTokens` // Array of reward tokens

**Methods & Getters**

* `.interestRateChartData` // Interest rate model chart points
* `.totalSupplyUSD` // Total supply in USD
* `.totalBorrowUSD` // Total borrow in USD
* `.totalReservesUSD` // Total reserves in USD
* `.utilizationPercent` // Utilization %
* `.collateralization` // Collateralization ratio
* `.totalValueLocked` // TVL
* `.borrowApr` // Borrow APR
* `.supplyApr` // Supply APR
* `.price` // Base token price
* `.totalEarned()` // Total earned
* `.totalBorrowed()` // Total borrowed
* `.netEarnAprs()` // Net earn APRs
* `.netBorrowAprs()` // Net borrow APRs
* `.totalCollateralsSupplyUSD()` // Total collaterals supply in USD
* `.marketsToMigrate(marketsList)` // Markets to migrate

## UserMarket

### **Description**

**UserMarket** is a class representing a user's participation in a specific market. It extends all properties and methods of **Market**, and adds user-specific balances, analytics, and collateral-related methods.

**Fields**

```typescript
constructor(userMarket: IUserMarket)
```

* `.borrowBalance` // User's current borrow balance (bigint)
* `.supplyBalance` // User's current supply balance (bigint)
* `.baseTokenBalance` // User's base token balance (bigint)
* `.collaterals` // Array of user collaterals (UserCollateral\[])

**Methods & Getters**

* `.borrowBalanceUSD` // User's borrow balance in USD
* `.supplyBalanceUSD` // User's supply balance in USD
* `.getTokenPrice(symbol, tokenPrice)` // Token price relative to the market's base token
* `.borrowCollateralValueUSD` // User's collateral value in USD
* `.getBorrowCollateralValueUSD(customCollaterals)` // Collateral value with custom collaterals
* `.borrowCapacityMarketUSD` // User's borrowing capacity in USD
* `.getBorrowCapacityMarketUSD(customCollaterals)` // Borrowing capacity with custom collaterals
* `.maxWithDrawCollateralAmount` // Maximum withdrawable collateral amount
* `.findMarketCollateralByAddress(collateralAddress)` // Find collateral by address
* `.isSomeTokenSmallAllowance(collateralsAllowances)` // Checks if any collateral has too small allowance
* `.isAllCollateralsFromMarket(supplyCollaterals)` // Checks if all collaterals are from the market
* `.availableToBorrow` // Amount available for the user to borrow
* `.earnAprCustom(userSupplyValue)` // Custom earn APR for the user
* `.borrowAprCustom(userBorrowValue)` // Custom borrow APR for the user
* `.netEarnAprsCustom(userSupplyValue)` // Custom net earn APRs for the user
* `.netBorrowAprsCustom(userBorrowValue)` // Custom net borrow APRs for the user

## User <a href="#user" id="user"></a>

### **Description**

**User** is a class representing a protocol user and their market participation.

### **Fields**

```typescript
constructor(userData: IUser)
```

* `.address` // User address
* `.borrowMarkets` // Array of borrowed market addresses
* `.lendMarkets` // Array of supplied market addresses

## Token <a href="#token" id="token"></a>

### **Description**

**Token** is a class representing an ERC20-like token entity.

### **Fields**

```typescript
constructor(tokenData: IToken)
```

* `.tokenAddress` // Token contract address
* `.symbol` // Token symbol
* `.decimals` // Token decimals (bigint)
* `.price` // Token price (string)
* `.priceFeedAddress` // Price feed contract address

## Curve <a href="#curve" id="curve"></a>

### **Description**

**Curve** is a class representing interest rate model parameters for a market.

### **Fields**

```typescript
constructor(curveData: ICurve)
```

* `.id` // Curve ID
* `.supplyKink` // Supply kink (bigint)
* `.supplyPerYearInterestRateSlopeLow` // Slope low (bigint)
* `.supplyPerYearInterestRateSlopeHigh` // Slope high (bigint)
* `.supplyPerYearInterestRateBase` // Base rate (bigint)
* `.borrowKink` // Borrow kink (bigint)
* `.borrowPerYearInterestRateSlopeLow` // Slope low (bigint)
* `.borrowPerYearInterestRateSlopeHigh` // Slope high (bigint)
* `.borrowPerYearInterestRateBase` // Base rate (bigint)

## MarketMethods <a href="#marketmethods" id="marketmethods"></a>

### **Description**

**MarketMethods** is a namespace of static utility functions for market analytics and calculations.

### **Key Methods**

* `calcApr(rate: bigint): number` // Calculate APR from per-second rate
* `getTVL(cometBalance: bigint, baseToken, collaterals): number` // Total value locked
* `getUtilization(utilization: bigint): number` // Utilization %
* `getInterestRateChartData(utilization: number, curvePresets): IMarketInterestRateModel[]` // Chart data for interest rate model
* `totalEarned(baseTokenPrice: string, marketTotalSupply: bigint): bigint` // Total earned
* `totalBorrowed(baseTokenPrice: string, marketTotalBorrow: bigint): bigint` // Total borrowed
* `netEarnAprs(baseToken, totalSupplied, compToken, rewardTokens, supplyApr): number[]` // Net earn APRs
* `netBorrowAprs(baseToken, totalBorrowed, compToken, rewardTokens, borrowApr): number[]` // Net borrow APRs

## UserMarketMethods <a href="#usermarketmethods" id="usermarketmethods"></a>

**Description**

**UserMarketMethods** provides static methods for user-market analytics (e.g., borrow/supply balances, collateral checks).

**Key Methods**

* `borrowBalanceUsd(borrowBalance: bigint, baseDecimals: bigint, basePriceUsd: string): number`// Calculates the user's borrow balance in USD.
* `supplyBalanceUsd(supplyBalance: bigint, baseDecimals: bigint, basePriceUsd: string): number` // Calculates the user's supply balance in USD.
* `tokenPrice(symbol: string, tokenPrice: bigint, basePriceUsd: string): number`// Returns the price of a token relative to the market's base token.
* `borrowCollateralValueUSD(collaterals: UserCollateral[], basePriceUsd: string): number`// Calculates the total USD value of the user's supplied collaterals.
* `borrowCollateralValueCustomUsd(collaterals: UserCollateral[], customCollaterals: ICustomCollateral[], basePriceUsd: string): number`// Calculates the collateral value in USD, including custom collaterals.
* `borrowCapacityMarketUsd(collaterals: UserCollateral[], basePriceUsd: string): number`// Calculates the user's borrowing capacity in USD based on their collaterals.
* `borrowCapacityMarketCustomUsd(collaterals: UserCollateral[], customCollaterals: ICustomCollateral[], basePriceUsd: string): number`// Calculates borrowing capacity in USD with custom collaterals.
* `maxWithdrawCollateralAmount(borrowCapacityUsd: number, supplyBalance: bigint, borrowBalance: bigint, baseDecimals: bigint, basePriceUsd: string): string | number`// Returns the maximum amount of collateral the user can withdraw.
* `findMarketCollateralByAddress(collateralAddress: Address, collaterals: UserCollateral[]): UserCollateral | undefined`// Finds a collateral in the market by its address.
* `isSomeTokenAllowanceTooSmall(collaterals: UserCollateral[], collateralsAllowances: MultiAllowanceResponseType[]): boolean`// Checks if any collateral has an allowance that is too small for the intended operation.
* `isAllCollateralsFromMarket(collaterals: UserCollateral[], supplyCollaterals: ICustomCollateral[]): boolean`// Checks if all supplied collaterals are present in the market.
* `availableToBorrow(collaterals: UserCollateral[], basePriceUsd: string, borrowBalance: bigint): string`// Calculates the amount available for the user to borrow.

### CollateralMethods <a href="#collateralmethods" id="collateralmethods"></a>

#### **Description**

**CollateralMethods** provides static methods for collateral analytics (e.g., total supply USD, reserves, percent, caps).

**Key Methods**

* `getTotalSupplyUSD(decimals: bigint, price: string, totalSupply?: bigint): number`// Calculates the total supply of a collateral in USD.
* `getCollateralReservesUSD(collateralReserves: bigint, decimals: bigint, price: string): number`// Calculates the USD value of the collateral reserves.
* `getCollateralPercent(collateralFactor: bigint): number`// Returns the collateral factor as a percentage.
* `getSupplyCapUSD(supplyCap: bigint, decimals: bigint, price: string): number`// Calculates the supply cap of a collateral in USD.
* `getRemainingCapacityUSD(totalSupplyUSD: number, supplyCapUSD: number): number`// Returns the remaining supply capacity in USD.
* `getRemainingCapacityPercent(totalSupplyUSD: number, supplyCapUSD: number): number`// Returns the remaining supply capacity as a percentage.

## DataUtils

```typescript
static validateNumericInput(input: string): boolean  // Parse string to bigint
```

```typescript
static toBigNumber(value: string, decimals: number): bigint // Format bigint to string
```

```typescript
static parseTokenInput(input: string): string  // Parse user input
```

```typescript
static validateNumericInput(input: string): boolean // Validate numeric inpu
```

## Types <a href="#types" id="types"></a>

### IMarket

```typescript
interface IMarket {
  chain: number; // Chain ID
  cometAddress: string; // Market contract address
  utilization: bigint; // Utilization (scaled, e.g. 1e18 = 100%)
  supplyRate: bigint; // Supply rate (per second, scaled)
  borrowRate: bigint; // Borrow rate (per second, scaled)
  borrowMinAmount: bigint; // Minimum borrow amount
  totalBorrow: bigint; // Total borrowed (base token)
  totalSupply: bigint; // Total supplied (base token)
  totalReserves: bigint; // Total reserves (base token)
  baseToken: IBase; // Base token entity
  collaterals: Collateral[]; // Array of collateral tokens
  availableLiquidity: bigint; // Available liquidity (base token)
  configControllerAddress: string; // Config controller address
  ownerAddress: string; // Owner address
  guardianAddress: string; // Guardian address
  curatorAddress: string; // Curator address
  curatorFee: number; // Curator fee (percent)
  proposals: IMarketProposalTx[]; // Array of market proposals
  compToken: IToken; // COMP token entity
  rewardTokens: IToken[]; // Array of reward tokens
}
```

### IUser

```typescript
interface IUser {
  address: string; // User address
  borrowMarkets: string[]; // Array of borrowed market addresses
  lendMarkets: string[]; // Array of supplied market addresses
}
```

### IUserMarket

```typescript
interface IUserMarket extends IMarket {
  borrowBalance: bigint; // User's borrow balance (base token)
  supplyBalance: bigint; // User's supply balance (base token)
  baseTokenBalance: bigint; // User's base token wallet balance
  collaterals: UserCollateral[]; // Array of user collaterals
}
```

### IToken

```typescript
interface IToken {
  tokenAddress: string; // Token contract address
  symbol: string; // Token symbol
  decimals: bigint; // Token decimals
  price: string; // Token price (as string, e.g. "1.00")
  priceFeedAddress: string; // Price feed contract address
}
```

### IBase

```typescript
interface IBase extends IToken {
  baseMinBorrow: bigint; // Minimum borrow amount for base token
  baseMinForRewards: bigint; // Minimum supply for rewards
  baseTrackingBorrowSpeed: bigint; // Borrow speed for rewards tracking
  baseTrackingSupplySpeed: bigint; // Supply speed for rewards tracking
  baseIndexScale: bigint; // Index scale for base token
  curvePresets: ICurve[]; // Array of interest rate curve presets
}
```

### ICurve

```typescript
interface ICurve {
  id: string; // Curve ID
  supplyKink: bigint; // Supply kink utilization (scaled)
  supplyPerYearInterestRateSlopeLow: bigint; // Slope below kink (supply)
  supplyPerYearInterestRateSlopeHigh: bigint; // Slope above kink (supply)
  supplyPerYearInterestRateBase: bigint; // Base supply rate
  borrowKink: bigint; // Borrow kink utilization (scaled)
  borrowPerYearInterestRateSlopeLow: bigint; // Slope below kink (borrow)
  borrowPerYearInterestRateSlopeHigh: bigint; // Slope above kink (borrow)
  borrowPerYearInterestRateBase: bigint; // Base borrow rate
}
```

### ICollateral

```typescript
interface ICollateral extends IToken {
  totalSupplyAsset: bigint; // Total supply of collateral asset
  collateralReserves: bigint; // Collateral reserves
  cometBalance: bigint; // Comet's balance of this collateral
  collateralFactor: bigint; // Collateral factor (scaled)
  liquidationFactor: bigint; // Liquidation factor (scaled)
  liquidationPenalty: bigint; // Liquidation penalty (scaled)
  supplyCap: bigint; // Supply cap for this collateral
}
```

### IUserCollateral

```typescript
interface IUserCollateral extends ICollateral {
  userBalance: bigint; // User's wallet balance of this collateral
  userSupplyBalance: bigint; // User's supplied balance of this collateral
}
```

### IMarketProposalTx

```typescript
interface IMarketProposalTx {
  name: string; // Proposal name
  date: Date; // Proposal date
  txHash: string; // Transaction hash
  collateralsParams: ICollateralParams[]; // Collateral parameters for the proposal
}
```

### ICollateralParams

```typescript
interface ICollateralParams {
  collateralFactor: bigint; // Collateral factor (scaled)
  liquidationFactor: bigint; // Liquidation factor (scaled)
  liquidationPenalty: bigint; // Liquidation penalty (scaled)
  supplyCap: bigint; // Supply cap for this collateral
}
```
