# disposed

```ts
const disposed: Disposer;
```

A reference to a static `Disposer` instance that has been disposed.

## Example

```ts
import { disposer, disposed } from "@monstermann/signals";

function example() {
    if (condition) {
        return disposed;
    } else {
        return disposer();
    }
}

const dispose = example();
dispose();
```
