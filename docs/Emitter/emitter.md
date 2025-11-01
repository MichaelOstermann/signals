# emitter

```ts
function emitter<T = void>(options?: EmitterOptions<T>): Emitter<T>;
```

Emitters are simple `EventEmitter`s that ship a single event. Emitting events is [untracked](../Tracking/untrack) and [batched](../Batching/batch).

## Example

```ts
import { emitter, onDispose, dispose } from "@monstermann/signals";

const onMsg = emitter<string>();

// Subscribe:
const unsubscribe = onMsg((msg) => console.log(msg));

// Unsubscribe:
unsubscribe();

// Emit (batched + untracked):
onMsg("Hello world!");

// Do something before disposal:
onDispose(onMsg, () => {});

// Dispose:
dispose(onMsg);
```

## Options

```ts
{
    // Provide a custom name, overriding unplugin-signals:
    name: "",
    // Whether this emitter should be considered to be an implementation detail:
    // If set to `true`, implies `silent` and is excluded from `getEmitters`.
    internal: true,
    // Whether this emitter should emit debugging events:
    silent: true,
    // Provide a custom handler:
    handler(emitter, message) {
        // Example: Invoke callbacks in reverse order:
        let node = emitter.tail;
        while (node) {
            node.value(message);
            node = node.prev;
        }
    },
    // Do something when this emitter is being watched (memo/effect):
    onWatch() {
        // Do something when this emitter is no longer being watched:
        return () => {};
    },
};
```

## Splitting Events

While emitters only emit single events, you can quickly emulate an `EventEmitter`:

```ts
const onStatus = emitter<"open" | "close">();
const onOpen = (callback) => onStatus((msg) => msg === "open" && callback());
const onClose = (callback) => onStatus((msg) => msg === "close" && callback());

const stop = onStatus((status) => console.log(status));
const stop = onOpen(() => console.log("opened"));
const stop = onClose(() => console.log("closed"));
```
