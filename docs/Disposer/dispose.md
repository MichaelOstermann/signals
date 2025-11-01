# dispose

```ts
function dispose(target: DisposerMixin): void;
```

Invokes all callbacks or other `Disposer`s attached to the target, in reverse order.

The process of disposing is batched and untracked.

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
