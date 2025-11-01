# signal

```ts
function signal<T>(value: T, options?: SignalOptions<T>): Signal<T>;
```

Signals are a primitive that describe values that change over time.

## Example

```ts
import { signal } from "@monstermann/signals";

// Create:
const count = signal(0);

// Update:
signal(1);

// Transform:
signal((n) => n + 1);

// Read:
signal(); // 2
```

## Options

```ts
{
    // Provide a custom name, overriding unplugin-signals:
    name: "",
    // Whether this signal should be considered to be an implementation detail:
    // If set to `true`, implies `silent` and is excluded from `getSignals`.
    internal: true,
    // Whether this signal should emit debugging events:
    silent: true,
    // Provide a custom comparator (runs after a basic === check):
    equals(before, after) {
        return true;
    },
    // Do something before this signal is being read from:
    onRead() {},
    // Do something when this signal is being watched (memo/effect):
    onWatch() {
        // Do something when this signal is no longer being watched:
        return () => {};
    },
};
```
