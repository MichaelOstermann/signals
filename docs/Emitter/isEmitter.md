# isEmitter

```ts
function isEmitter(value: unknown): value is Emitter;
```

Checks whether a value of `unknown` type is an `Emitter`.

## Example

```ts
import { isEmitter, emitter } from "@monstermann/signals";

isEmitter(emitter(...)); // true
isEmitter(null); // false
```
