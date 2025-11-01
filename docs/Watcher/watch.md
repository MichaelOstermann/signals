# watch

```ts
function watch(
    dependencies: ReadonlySignal<T> | Memo<T> | (() => T),
    computation: (next: T, prev: T) => MaybeDispose,
    options?: WatcherOptions<T>,
): Watcher;
```

Watchers allow you to react to changes made to signals, or derived state.

## Example

```ts
import {
    signal,
    watch,
    onCleanup,
    onDispose,
    dispose,
} from "@monstermann/signals";

const count = signal(0);

const w = watch(
    () => count(),
    (after, before) => {
        console.log(before, after);

        // Do something before this runs next time, or gets disposed:
        onCleanup(() => {});
        return () => {};
    },
);

// Prints: 0, 1
count(1);

// Do something before disposal:
w(() => {});
onDispose(w, () => {});

// Dispose:
w();
dispose(w);
```

## Options

```ts
watcher(Function, Function, {
    // Provide a custom name, overriding unplugin-signals:
    name: "",
    // Whether this watcher should be considered to be an implementation detail:
    // If set to `true`, implies `silent`.
    internal: true,
    // Whether this watcher should emit debugging events:
    silent: true,
    // Provide a custom comparator (runs after a basic === check):
    // Only used when passing a function as the first parameter.
    equals(before, after) {
        return true;
    },
});
```
