# reducer

```ts
function reducer(
    initialState: T,
    reduce: (state: T, action: U) => T,
    options?: ReducerOptions<T>,
): Reducer<T, U>;
```

Reducers are signals that emulate the behavior of eg. React's `useReducer` or Redux Stores.

## Example

```ts
import { reducer } from "@monstermann/signals";

type Action = { type: "inc" } | { type: "dec" };

// Create:
const count = reducer<number, Action>(0, (count, action) => {
    if (action.type === "inc") return count + 1;
    if (action.type === "dec") return count - 1;
    return count;
});

// Dispatch:
count({ type: "inc" });

// Read:
count(); // 1
```

## Options

```ts
{
    // Provide a custom name, overriding unplugin-signals:
    name: "",
    // Whether this reducer should be considered to be an implementation detail:
    // If set to `true`, implies `silent` and is excluded from `getReducers`.
    internal: true,
    // Whether this reducer should emit debugging events:
    silent: true,
    // Provide a custom comparator (runs after a basic === check):
    equals(before, after) {
        return true;
    },
    // Do something before this reducer is being read from:
    onRead() {},
    // Do something when this reducer is being watched (memo/effect):
    onWatch() {
        // Do something when this reducer is no longer being watched:
        return () => {};
    },
};
```
