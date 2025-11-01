# isWatcher

```ts
function isWatcher(value: unknown): value is Watcher;
```

Checks whether a value of `unknown` type is an `Watcher`.

## Example

```ts
import { isWatcher, watch } from "@monstermann/signals";

isWatcher(watch(...)); // true
isWatcher(null); // false
```
