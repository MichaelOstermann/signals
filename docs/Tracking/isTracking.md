# isTracking

```ts
function isTracking(): boolean;
```

Returns a boolean indicating whether something is currently tracking signal accesses.

## Example

```ts
import { effect, isTracking } from "@monstermann/signals";

isTracking(); // false
effect(() => {
    isTracking(); // true
});
isTracking(); // false
```
