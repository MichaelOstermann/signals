# currentWatcher

```ts
function currentWatcher(): Watcher | undefined;
```

Retrieves a reference to the nearest running `Watcher`, if any.

## Example

```ts
import { signal, watch, currentWatcher } from "@monstermann/signals";

const count = signal(0);

watch(count, () => {
    const dispose = currentWatcher();
    setTimeout(() => dispose?.());
});
```
