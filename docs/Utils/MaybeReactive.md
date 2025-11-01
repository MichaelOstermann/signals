# MaybeReactive

```ts
type MaybeReactive<T> = Reactive<T> | T;
```

A type that represents a value that may or may not be [`Reactive`](./Reactive).

## Example

```ts
import { MaybeReactive, read, signal, memo, reducer } from "@monstermann/signals";

function example(target: MaybeReactive<number>): number {
    return read(target)
}

example(signal(...));
example(memo(...));
example(reducer(...));
example(() => ...);
example(10);
```
