# disposeWatcher

```ts
function disposeWatcher(): void;
```

Disposes the nearest running `Watcher`, if any.

## Example

```ts
import { signal, watch, disposeWatcher } from "@monstermann/signals";

const count = signal(0);

watch(count, () => {
    disposeWatcher();
});
```
