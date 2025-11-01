# getActions

```ts
function getActions(): Action[];
```

Returns a list of all `Action`s currently held in memory.

## Example

```ts
import { getActions, action } from "@monstermann/signals";

const dispatch = action(...);
getActions(); // [dispatch]
```
