# isReducer

```ts
function isReducer(value: unknown): value is Reducer;
```

Checks whether a value of `unknown` type is a `Reducer`.

## Example

```ts
import { isReducer, reducer } from "@monstermann/signals";

isReducer(reducer(...)); // true
isReducer(null); // false
```
