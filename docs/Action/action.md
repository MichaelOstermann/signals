# action

```ts
function action(
    handler: (payload: T) => U,
    options?: ActionOptions,
): Action<T, U>;
```

Actions are plain functions that are [untracked](../Tracking/untrack) and [batched](../Batching/batch) that you can use to eg. update a collection of signals.

They emit [debugging events](../Debugging/onDevHook), so you can see which actions ran when, and what signals they updated.

## Example

```ts
import { action, signal, onCleanup } from "@monstermann/signals";

type Payload = { type: "inc" } | { type: "dec" };

const count = signal(0);

// Create:
const dispatch = action((payload: Payload): number => {
    switch (payload.type) {
        case "inc":
            count((n) => n + 1);
        case "dec":
            count((n) => n - 1);
    }
    // Do something before this runs next time:
    onCleanup(() => {});
    return count();
});

// Run (batched + untracked):
const result = dispatch({ type: "inc" });
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
