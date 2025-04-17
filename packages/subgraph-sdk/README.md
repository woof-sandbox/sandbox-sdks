# @sandbox/subgraph-sdk

A lightweight and efficient SDK for interacting with subgraphs, designed for clarity, reusability, and minimal overhead.

## Installation

```
npm install @sandbox/subgraph-sdk
```
## API Reference

```typescript
async function fetchCollection(
  iterationQuery: CollectionQuery,
  iterationCallback: CollectionCallback,
  subgraphUrl: string
): Promise<void>
```

#### Parameters

- `iterationQuery`: A function that generates GraphQL queries with pagination parameters
- `iterationCallback`: A callback function that processes each page of results
- `subgraphUrl`: The URL of the subgraph endpoint

### Types

```typescript
type CollectionQuery = (
  skip: number | string,
  pageSize: number | string,
) => string;

type CollectionCallback = (
  result: any,
  params: CollectionCallbackParams,
) => void;

interface CollectionCallbackParams {
  pageSize: number;
  loopFlag: boolean;
}
```
