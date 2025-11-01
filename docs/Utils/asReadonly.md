# asReadonly

```ts
function asReadonly<T>(target: Signal<T>): ReadonlySignal<T>;
function asReadonly<T>(target: Emitter<T>): ReadonlyEmitter<T>;
function asReadonly<T>(target: Reducer<T>): ReadonlyReducer<T>;
```

Can be used to cast `Signal`s, `Emitter`s and `Reducer`s to their read-only type variants.

## Example

```ts
import { signal, asReadonly } from "@monstermann/signals";

const $count = signal(0);

export const count = asReadonly($count);
```
