# peek

```ts
function peek(target: MaybeReactive<T>): T;
```

Reads from a [`MaybeReactive`](./MaybeReactive) without causing subscriptions.

## Example

```ts
import { read, signal, memo, reducer } from "@monstermann/signals"

peek(signal(...));
peek(memo(...));
peek(reducer(...));
peek(() => ...);
peek(value);
```
