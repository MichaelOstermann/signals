# memo

```ts
function memo<T>(computation: () => T, options?: MemoOptions<T>): Memo<T>;
```

Memos are functions that can compose/derive other signals. They are lazy in that they only refresh when they are being read from or subscribed to.

## Example

```ts
import { signal, memo } from "@monstermann/signals";

const count = signal(1);

// Create:
const double = memo(() => count() * 2);

// Read:
double(); // 2
```

## Options

```ts
{
    // Provide a custom name, overriding unplugin-signals:
    name: "",
    // Whether this memo should be considered to be an implementation detail:
    // If set to `true`, implies `silent` and is excluded from `getMemos`.
    internal: true,
    // Whether this memo should emit debugging events:
    silent: true,
    // Provide a custom comparator (runs after a basic === check):
    equals(before, after) {
        return true;
    },
    // Do something when this memo is being watched (memo/effect):
    onWatch() {
        // Do something when this memo is no longer being watched:
        return () => {};
    },
};
```
