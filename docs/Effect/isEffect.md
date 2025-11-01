# isEffect

```ts
function isEffect(value: unknown): value is Effect;
```

Checks whether a value of `unknown` type is an `Effect`.

## Example

```ts
import { isEffect, effect } from "@monstermann/signals";

isEffect(effect(...)); // true
isEffect(null); // false
```
