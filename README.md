# sandbox-sdks

## Start
1) `pnpm install`

## Testing
Every package comes with its own test configuration, tailored for the specific types of tests it includes.  
Tests can be run either from the root of the repository or directly within each individual package.  

`test` - default (unit)  
`test:unit` - Fast, deterministic, isolated tests for individual functions  
`test:e2e` - Full-stack tests that may involve external dependencies (e.g. RPC, contracts)  
`test:local` - Special tests for local dev environments (e.g., mocks or anvil-based tests)  

## Services
- Borrowing - calculation of the available borrowing limit, minBorrow check.
- Collateral - logic for interacting with collaterals, token approvals, and collateral supply.
- Lending - everything related to approvals, supply, approve, isAllowed, allowance.
- Transaction -  transaction confirmation, txHash tracking, transaction submission, and transaction status.

