# isAction

```ts
function isAction(value: unknown): value is Action;
```

Checks whether a value of `unknown` type is an `Action`.

## Example

```ts
import { isAction, action } from "@monstermann/signals";

isAction(action(...)); // true
isAction(null); // false
```
