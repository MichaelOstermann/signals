# getSignals

```ts
function getSignals(): Signal[];
```

Returns a list of all `Signal`s currently held in memory.

## Example

```ts
import { getSignals, signal } from "@monstermann/signals";

const count = signal(...)
getSignals(); // [count]
```
