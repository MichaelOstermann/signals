# Reactive

```ts
type Reactive<T> = Memo<T> | Signal<T> | ReadonlySignal<T>;
```

A type that represents all reactive values that can be read from.

## Example

```ts
import { Reactive, signal, memo, reducer } from "@monstermann/signals";

function example(target: Reactive<number>): number {
    return target()
}

example(signal(...));
example(memo(...));
example(reducer(...));
```
