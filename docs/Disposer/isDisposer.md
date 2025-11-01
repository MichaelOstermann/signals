# isDisposer

```ts
function isDisposer(target: unknown): target is DisposerMixin;
```

Checks whether a value of `unknown` type is an `Disposer`.

## Example

```ts
import { isDisposer, disposer } from "@monstermann/signals";

isDisposer(disposer(...)); // true
isDisposer(null); // false
```
