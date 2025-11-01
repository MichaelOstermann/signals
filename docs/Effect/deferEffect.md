# deferEffect

```ts
function deferEffect(
    fn: (
        resolve: (value: T) => void,
        reject: (reason?: any) => void,
    ) => MaybeDispose,
    options?: EffectOptions,
): Promise<T>;
```

`deferEffect` allows you to create a `Promise` that is resolved/rejected by using an `Effect`.

## Example

```ts
import { signal, deferEffect } from "@monstermann/signals";

const count = signal(0);

const deferred = deferEffect((resolve) => {
    if (count() === 0) return;
    resolve("Resolved!");
});

// Resolves deferred:
count(1);

await deferred; // "Resolved!"
```
