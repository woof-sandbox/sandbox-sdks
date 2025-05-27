# @woof-software/subgraph-sdk

A lightweight and efficient SDK for interacting with subgraphs, designed for clarity, reusability, and minimal overhead.

## Installation

```
npm install @woof-software/subgraph-sdk
```
## API Reference

```typescript
async function fetchCollection(
  iterationQuery: CollectionQuery,
  iterationCallback: CollectionCallback,
  subgraphUrl: string,
  options?: {
      authorization?: string;
      headers?: Record<string, string>;
  },
): Promise<void>
```

### Parameters

- `iterationQuery`: A function that generates GraphQL queries with pagination parameters
- `iterationCallback`: A callback function that processes each page of results
- `subgraphUrl`: The URL of the subgraph endpoint
- `authorization`: Optional authorization header value for authenticated requests

## Types

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
