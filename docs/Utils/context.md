# context

```ts
function context<T>(): Context<T>;
```

Allows you to temporarily define global context, similar to React's `createContext` / `useContext`.

## Example

```ts
import { context } from "@monstermann/signals";

// Create:
const ctx = context<string>();

// Set:
const prevCtx = ctx("Hello World!");

// Read:
ctx(); // "Hello World!"

// Restore:
ctx(prevCtx);
```
