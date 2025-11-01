# disposer

```ts
function disposer(...cleanups: MaybeDispose[]): Disposer;
```

Creates a new `Disposer` instance, which collects callbacks and other `Disposer` instances and invokes them in reverse order when disposed, cleaning up any references as necessary.

The process of disposing is batched and untracked.

## Example

```ts
import { disposer } from "@monstermann/signals";

const a = disposer();
const b = disposer();

// Register callbacks:
a(() => console.log(1));
b(() => console.log(2));
// Register other disposers:
a(b);

// Dispose - prints: 2, 1
a();

// No effect - already disposed.
a();
b();
```

```ts
import { disposer } from "@monstermann/signals";

const a = disposer();
const b = disposer();

a(() => console.log(1));
b(() => console.log(2));
a(b);

// Prints 2 and dereferences itself from `a`
b();

// Prints: 1
a();
```
