# effect

```ts
function effect(
    computation: () => MaybeDispose,
    options?: EffectOptions,
): Effect;
```

Effects are functions that continuously rerun whenever the signals accessed within changed.

## Example

```ts
import {
    signal,
    effect,
    onCleanup,
    onDispose,
    dispose,
} from "@monstermann/signals";

const count = signal(0);

// Create:
const e = effect(() => {
    console.log(count());

    // Do something before this runs next time, or gets disposed:
    onCleanup(() => {});
    return () => {};
});

// Do something before disposal:
e(() => {});
onDispose(e, () => {});

// Dispose:
e();
dispose(e);
```

## Options

```ts
{
    // Provide a custom name, overriding unplugin-signals:
    name: "",
    // Whether this effect should emit debugging events:
    silent: false,
};
```
