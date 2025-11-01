# onDispose

```ts
function onDispose(target: DisposerMixin, onDispose: MaybeDispose): T;
```

Attaches a callback or another `Disposer` that is invoked when the target gets disposed.

If called on an already disposed `Disposer`, immediately disposes the given value.

## Example

```ts
import { disposer, onDispose, dispose } from "@monstermann/signals";

const a = disposer();
const b = disposer();

onDispose(a, () => console.log(1));
onDispose(b, () => console.log(2));
onDispose(a, b);

// Prints: 2, 1
dispose(a);

// No effect - already disposed.
dispose(a);
dispose(b);
```
