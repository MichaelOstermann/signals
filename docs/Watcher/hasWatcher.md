# hasWatcher

```ts
function hasWatcher(): boolean;
```

Returns a boolean indicating whether a `Watcher` is currently running.

## Example

```ts
import { signal, watch, hasWatcher } from "@monstermann/signals";

const count = signal(0);

hasWatcher(); // false
watch(count, () => {
    hasWatcher(); // true
});
hasWatcher(); // false
```
