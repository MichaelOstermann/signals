# untrack

```ts
function untrack(fn: () => T): T;
```

Skips creating subscriptions for the duration of the provided callback.

## Example

```ts
import { signal, effect, untrack } from "@monstermann/signals";

const a = signal(0);
const b = signal(0);

effect(() => {
    console.log(a());
    untrack(() => console.log(b()));
});

// Prints: 1, 0
a(1);

// No effect:
b(1);
```
