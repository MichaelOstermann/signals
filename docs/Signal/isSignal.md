# isSignal

```ts
function isSignal(value: unknown): value is Signal;
```

Checks whether a value of `unknown` type is a `Signal`.

## Example

```ts
import { isSignal, signal } from "@monstermann/signals";

isSignal(signal(...)); // true
isSignal(null); // false
```
