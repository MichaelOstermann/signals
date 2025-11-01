# getReducers

```ts
function getReducers(): Reducer[];
```

Returns a list of all `Reducer`s currently held in memory.

## Example

```ts
import { getReducers, reducer } from "@monstermann/signals";

const count = reducer(...);
getReducers(); // [count]
```
