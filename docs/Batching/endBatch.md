# endBatch

```ts
function endBatch(): void;
```

Similar to [`batch`](./batch), but allows you to manually control when batching is done.

## Example

```ts
import { signal, effect, startBatch, endBatch } from "@monstermann/signals";

const a = signal(0);
const b = signal(0);

effect(() => console.log(a(), b()));

startBatch();
try {
    a(1);
    b(1);
} finally {
    // Prints: 2, 2
    endBatch();
}
```
