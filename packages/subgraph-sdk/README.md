# @woof-software/subgraph-sdk

A lightweight and efficient SDK for interacting with subgraphs (The Graph), designed for clarity, reusability, and minimal overhead.

---

## Installation

```bash
npm install @woof-software/subgraph-sdk
```

---

## Quickstart

```typescript
import { fetchSingle, fetchCollection, formWhere } from '@woof-software/subgraph-sdk';

// Simple query example
const query = `{
  markets(first: 1) { id name }
}`;
const url = 'https://api.thegraph.com/subgraphs/name/your/subgraph';
const data = await fetchSingle(query, url);
console.log(data);

// Paginated query example
import type { CollectionCallbackParams } from '@woof-software/subgraph-sdk';

const collectionQuery = (skip: number, pageSize: number) => `{
  markets(first: ${pageSize}, skip: ${skip}) { id name }
}`;

await fetchCollection(
  collectionQuery,
  (result, params: CollectionCallbackParams) => {
    if (!result.data.markets.length) params.loopFlag = false;
    // process each page
    console.log(result.data.markets);
  },
  url
);
```

---

## API

### fetchSingle

```typescript
async function fetchSingle<T = any>(
  query: string,
  subgraphUrl: string,
  options?: { token?: string }
): Promise<T>
```
- `query`: String with the GraphQL query
- `subgraphUrl`: The subgraph endpoint URL
- `options.token`: (optional) Bearer token for authorization

Returns: `Promise<T>` — the query result (usually an object with a `data` field).

---

### fetchCollection

```typescript
async function fetchCollection(
  iterationQueryFactory: CollectionQueryFactory,
  iterationCallback: CollectionCallback,
  subgraphUrl: string,
  options?: { token?: string }
): Promise<void>
```
- `iterationQueryFactory(skip, pageSize)`: function returning a GraphQL query string for each page
- `iterationCallback(result, params)`: function to process each page
  - `params.loopFlag`: set to `false` to stop pagination
  - `params.pageSize`: page size
- `subgraphUrl`: The subgraph endpoint URL
- `options.token`: (optional) Bearer token for authorization

---

### Types

```typescript
export type CollectionQueryFactory = (skip: number | string, pageSize: number | string) => string;
export type CollectionCallback = (result: any, params: CollectionCallbackParams) => void;
export interface CollectionCallbackParams {
  pageSize: number;
  loopFlag: boolean;
}
export interface PaginationParams {
  cursorValue?: string;
  cursorFieldName: string;
  sortOrder: 'asc' | 'desc';
  first: string | number;
}
```

---

### Helpers

- `formWhere(where: Record<string, string | string[]>): string` — builds a GraphQL `where` filter string
- `formHeaders(options?: { token?: string }): Record<string, string>` — builds HTTP headers
- `formPaginationConditions(pagination: PaginationParams): string` — builds pagination conditions for GraphQL

**Example:**
```typescript
import { formWhere } from '@woof-software/subgraph-sdk';
const where = formWhere({ id: '0x123', status: ['active', 'pending'] });
// => '{ id: "0x123", status: ["active", "pending"] }'
```

---

## Best Practices
- Use `fetchCollection` for large datasets with page-by-page processing.
- For complex filters, use `formWhere` and dynamic query generation.
- Always handle errors (e.g., with try/catch) — the SDK throws on network or GraphQL errors.
- For private subgraphs, use the `token` option.

---

## Scripts & Testing

- `npm run build` — build the package
- `npm test` — run unit tests (Vitest)


