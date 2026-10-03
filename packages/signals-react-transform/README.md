<div align="center">

<h1>signals-react-transform</h1>

**Wraps reads of signals in React components with `useSignal`.**

</div>

Before:

```tsx
export function Component({ className }) {
    const style = $style();
    return (
        <div style={style} className={$class() + className}>
            {$content()}
        </div>
    );
}
```

After:

```tsx
import { useSignal } from "@monstermann/signals-react";
export function Component({ className }) {
    const style = useSignal($style);
    return (
        <div style={style} className={useSignal(() => $class() + className)}>
            {useSignal($content)}
        </div>
    );
}
```

Signals are recognized by their name, which has to start with a `$`: `$count()`, `state.$count()`.

## Installation

```sh
bun add @monstermann/signals-react
bun add -D @monstermann/signals-react-transform
```

## Usage

### Vite, Rolldown, tsdown

```ts
import { signalsReact } from "@monstermann/signals-react-transform";

export default defineConfig({
    plugins: [signalsReact()],
});
```

| Option    | Default        | Description                                               |
| --------- | -------------- | --------------------------------------------------------- |
| `include` | `/\.[jt]sx?$/` | RegExp(s), only files whose path matches are transformed. |
| `exclude` |                | RegExp(s), files whose path matches are skipped.          |
| `enforce` |                | `"pre"` or `"post"`.                                      |

### Bun

`Bun.build` only uses the first `onLoad` that returns something, so call `transform` from your own:

```ts
import { transform } from "@monstermann/signals-react-transform";

await Bun.build({
    entrypoints: ["./src/index.tsx"],
    plugins: [
        {
            name: "transforms",
            setup(build) {
                build.onLoad(
                    { filter: /\.tsx?$/ },
                    async ({ loader, path }) => {
                        const code = await Bun.file(path).text();
                        return {
                            contents: transform(code, path)?.code ?? code,
                            loader,
                        };
                    },
                );
            },
        },
    ],
});
```

## Details

- Requires the [React Compiler](https://react.dev/learn/react-compiler). Expressions such as `$class() + className` become `useSignal(() => …)`, and without the compiler memoizing that function, it is a new one on every render and gets subscribed to again each time.
- Only functions that look like components or hooks are transformed: a name starting with an uppercase letter or `use`, or a body containing JSX.
- A read becomes a hook call in the place where it is written, so the rules of hooks apply: no reads inside conditions, loops, callbacks or after an early return.
- A read inside the arguments of another hook (`useThing($count())`) wraps the argument, not the hook.
- Reads that are already inside `useSignal(…)` are left alone.
- Files without a `$` are skipped without being parsed.
