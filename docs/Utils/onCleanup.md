# onCleanup

```ts
function onCleanup(onDispose: MaybeDispose): MaybeDispose;
```

Allows you to register callbacks that are invoked when `Action`s, `Effect`s or `Watcher`s rerun or get disposed.

## Example

```ts
import { effect, onCleanup } from "@monstermann/signals";

effect(() => {
    // Do something before this runs next time, or gets disposed:
    onCleanup(() => {});
});
```
