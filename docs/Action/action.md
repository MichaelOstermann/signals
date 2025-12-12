# action

```ts
function action(
    handler: (...args: T) => U,
    options?: ActionOptions,
): Action<T, U>;
```

Actions are plain functions that are [untracked](../Tracking/untrack) and [batched](../Batching/batch) that you can use to eg. update a collection of signals.

They emit [debugging events](../Debugging/onDevHook), so you can see which actions ran when, and what signals they updated.

## Example

```ts
import { action, signal, onCleanup } from "@monstermann/signals";

const count = signal(0);

// Create:
const updateCount = action(
    (type: "inc" | "dec", amount: number = 1): number => {
        switch (type) {
            case "inc":
                count((n) => n + amount);
                break;
            case "dec":
                count((n) => n - amount);
                break;
        }
        // Do something before this runs next time:
        onCleanup(() => {});
        return count();
    },
);

// Run (batched + untracked):
const result = updateCount("inc", 5);
```

## Options

```ts
{
    // Provide a custom name, overriding unplugin-signals:
    name: "",
    // Whether this action should be considered to be an implementation detail:
    // If set to `true`, implies `silent` and is excluded from `getActions`.
    internal: true,
    // Whether this action should emit debugging events:
    silent: true,
};
```
