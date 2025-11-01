# isReactive

```ts
function isReactive(value: unknown): value is Reactive;
```

Returns a boolean indicating where a value of type `unknown` is [`Reactive`](./Reactive).

## Example

```ts
import { isReactive, signal, memo, reducer } from "@monstermann/signals"

isReactive(signal(...)); // true
isReactive(memo(...)); // true
isReactive(reducer(...)); // true
isReactive(null); // false
```
