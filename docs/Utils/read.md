# read

```ts
function read(target: MaybeReactive<T>): T;
```

Reads from a [`MaybeReactive`](./MaybeReactive).

## Example

```ts
import { read, signal, memo, reducer } from "@monstermann/signals"

read(signal(...));
read(memo(...));
read(reducer(...));
read(() => ...);
read(value);
```
