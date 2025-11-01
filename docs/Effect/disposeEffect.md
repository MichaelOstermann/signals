# disposeEffect

```ts
function disposeEffect(): void;
```

Disposes the nearest running `Effect`, if any.

## Example

```ts
import { effect, disposeEffect } from "@monstermann/signals";

effect(() => {
    disposeEffect();
});
```
