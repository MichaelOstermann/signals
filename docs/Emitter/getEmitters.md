# getEmitters

```ts
function getEmitters(): Emitter[];
```

Returns a list of all `Emitter`s currently held in memory.

## Example

```ts
import { getEmitters, emitter } from "@monstermann/signals";

const onMsg = emitter(...);
getEmitters(); // [onMsg]
```
