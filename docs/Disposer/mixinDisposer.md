# mixinDisposer

```ts
function mixinDisposer<T extends object>(target: T): T & DisposerMixin;
```

Takes an object and extends it with `Disposer` properties.

## Example

```ts
import { mixinDisposer, onDispose, dispose } from "@monstermann/signals";

const example = mixinDisposer(() => console.log("Hello world!"));

// Prints: "Hello world!"
example();

// Use disposer utils:
onDispose(example, () => {});
dispose(example);
```
