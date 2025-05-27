# @woof-software/subgraph-sdk

A lightweight and efficient SDK for interacting with subgraphs, designed for clarity, reusability, and minimal overhead.

## Installation

```
npm install @woof-software/subgraph-sdk
```
## API Reference

```typescript
async function fetchItem<T>(
    query: string,
    subgraphUrl: string,
    options: {
        token?: string; 
    } = {},
): Promise<T> {

async function fetchCollection(
  iterationQuery: CollectionQuery,
  iterationCallback: CollectionCallback,
  subgraphUrl: string,
  options: {
    token?: string;
  } = {},
): Promise<void> {
```

### Parameters

#### fetchItem
- `query`: A function that generates a GraphQL query
- `itemCallback`: A callback function that processes the query result
- `subgraphUrl`: The URL of the subgraph endpoint
- `options`: Optional configuration object
  - `authorization`: Optional authorization header value for authenticated requests
  - `headers`: Optional additional headers to include in the request

#### fetchCollection
- `iterationQuery`: A function that generates GraphQL queries with pagination parameters
- `iterationCallback`: A callback function that processes each page of results
- `subgraphUrl`: The URL of the subgraph endpoint
- `options`: Optional configuration object
  - `authorization`: Optional authorization header value for authenticated requests
  - `headers`: Optional additional headers to include in the request

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
