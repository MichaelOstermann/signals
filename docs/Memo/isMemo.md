# isMemo

```ts
function isMemo(value: unknown): value is Memo;
```

Checks whether a value of `unknown` type is a `Memo`.

## Example

```ts
import { isMemo, memo } from "@monstermann/signals";

isMemo(memo(...)); // true
isMemo(null); // false
```
