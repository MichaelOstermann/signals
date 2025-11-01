# onDevHook

```ts
function onDevHook(callback: (event: HookEvent) => void): Dispose;
```

Allows you to subscribe to the various debugging events emitted by this library.

## Example

```ts
import { onDevHook } from "@monstermann/signals";

const unsubscribe = onDevHook((event) => console.log(event));
unsubscribe();
```

## Events

```ts
type HookEvent =
    | { name: "BATCH_START" }
    | { name: "BATCH_END" }
    | { error: Error; name: "ERROR" }
    | { action: Action; input: unknown; name: "ACTION_START" }
    | { action: Action; name: "ACTION_END"; output: unknown }
    | { effect: Effect; name: "EFFECT_START" }
    | { effect: Effect; name: "EFFECT_END" }
    | { emitter: Emitter; message: unknown; name: "EMITTER_START" }
    | { emitter: Emitter; name: "EMITTER_END" }
    | { memo: Memo; name: "MEMO_START"; value: unknown }
    | { equal: boolean; memo: Memo; name: "MEMO_END"; value: unknown }
    | { name: "SIGNAL_WRITE"; next: unknown; prev: unknown; signal: Signal }
    | {
          action: unknown;
          name: "REDUCER_WRITE";
          next: unknown;
          prev: unknown;
          reducer: Reducer;
      }
    | { name: "WATCHER_START"; value: unknown; watcher: Watcher }
    | { name: "WATCHER_END"; value: unknown; watcher: Watcher };
```
