# currentEffect

```ts
function currentEffect(): Effect | undefined;
```

Retrieves a reference to the nearest running `Effect`, if any.

## Example

```ts
import { effect, currentEffect } from "@monstermann/signals";

effect(() => {
    const dispose = currentEffect();
    setTimeout(() => dispose?.());
});
```
