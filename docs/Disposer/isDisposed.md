# isDisposed

```ts
function isDisposed(target: DisposerMixin): boolean;
```

Returns a boolean indicating whether the target `Disposer` has been disposed.

## Example

```ts
import { disposer, isDisposed } from "@monstermann/signals";

const d = disposer();

isDisposed(d); // false
d();
isDisposed(d); // true
```
