# hasEffect

```ts
function hasEffect(): boolean;
```

Returns a boolean indicating whether an `Effect` is currently running.

## Example

```ts
import { effect, hasEffect } from "@monstermann/signals";

hasEffect(); // false
effect(() => {
    hasEffect(); // true
});
hasEffect(); // false
```
