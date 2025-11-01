# getMemos

```ts
function getMemos(): Memo[];
```

Returns a list of all `Memo`s currently held in memory.

## Example

```ts
import { getMemos, memo } from "@monstermann/signals";

const double = memo(...)
getMemos(); // [double]
```
