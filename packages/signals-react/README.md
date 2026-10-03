<div align="center">

<h1>signals-react</h1>

**React integration for `@monstermann/signals`.**

</div>

```tsx
import { memo, signal } from "@monstermann/signals";
import { useSignal } from "@monstermann/signals-react";

const $count = signal(0);
const $double = memo(() => $count() * 2);

export function Counter({ offset }: { offset: number }) {
    const count = useSignal($count);
    const double = useSignal($double);
    // Plain functions are wrapped with a memo:
    const total = useSignal(() => $count() + offset);

    return <button onClick={() => $count((n) => n + 1)}>{count}</button>;
}
```

`useSignal` takes a signal, memo, reducer or function, subscribes the component with `useSyncExternalStore` and returns the current value.

[`@monstermann/signals-react-transform`](../signals-react-transform) writes the `useSignal` calls for you.

## Installation

```sh
bun add @monstermann/signals @monstermann/signals-react
```
