# isBatching

```ts
function isBatching(): boolean;
```

Returns a boolean indicating whether a batch is currently scheduled.

## Example

```ts
import { batch, isBatching } from "@monstermann/signals";

isBatching(); // false
batch(() => {
    isBatching(); // true
});
isBatching(); // false
```
