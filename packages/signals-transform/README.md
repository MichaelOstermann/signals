<div align="center">

<h1>signals-transform</h1>

**Disposes the effects of `@monstermann/signals` during HMR and writes `useSignal` for React.**

</div>

- During development, effects, watchers and emitters are disposed when the module that created them is replaced (HMR).
- With `react`, reads of signals in components are wrapped with `useSignal`, see [React](#react).

A production build without `react` is left untouched.

## Installation

```sh
bun add -D @monstermann/signals-transform
```

## Usage

### Vite, Rolldown, tsdown

```ts
import { signals } from "@monstermann/signals-transform";

export default defineConfig({
    plugins: [signals()],
});
```

| Option    | Default        | Description                                                                       |
| --------- | -------------- | --------------------------------------------------------------------------------- |
| `hmr`     | `false`        | `true` in the dev server of Vite. Relies on `import.meta.hot`.                    |
| `react`   | `false`        | Wraps reads of signals in React components with `useSignal`, see [React](#react). |
| `include` | `/\.[jt]sx?$/` | RegExp(s), only files whose path matches are transformed.                         |
| `exclude` |                | RegExp(s), files whose path matches are skipped.                                  |
| `enforce` |                | `"pre"` or `"post"`.                                                              |

### Bun

`Bun.build` only uses the first `onLoad` that returns something, so call `transform` from your own:

```ts
import { transform } from "@monstermann/signals-transform";

await Bun.build({
    entrypoints: ["./src/index.ts"],
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

## React

With `react: true`, reads of signals inside of components and hooks are wrapped with `useSignal` from [`@monstermann/signals-react`](../signals-react):

```ts
signals({ react: true });
```

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

- Signals are recognized by their name, which has to start with a `$`: `$count()`, `state.$count()`.
- Requires the [React Compiler](https://react.dev/learn/react-compiler). Expressions such as `$class() + className` become `useSignal(() => …)`, and without the compiler memoizing that function, it is a new one on every render and gets subscribed to again each time.
- Only functions that look like components or hooks are transformed: a name starting with an uppercase letter or `use`, or a body containing JSX.
- A read becomes a hook call in the place where it is written, so the rules of hooks apply: no reads inside conditions, loops, callbacks or after an early return.
- A read inside the arguments of another hook (`useThing($count())`) wraps the argument, not the hook.
- Reads that are already inside `useSignal(…)` are left alone.
- Files without a `$` are skipped by this step without being parsed.

## HMR

When a module is replaced during development, the effects, watchers and emitters its previous version created would keep running. With `hmr`, they are disposed right before the module runs again, and when it is removed.

```ts
import { effect } from "@monstermann/signals";

effect(() => {});
```

```ts
import { effect } from "@monstermann/signals";
const hmr = import.meta.hot
    ? (import.meta.hot.data["@monstermann/meta"] ??= new globalThis.Set())
    : undefined;
// …calls and clears `hmr` when the module is replaced or removed
const meta = { hmr: hmr };

effect(() => {}, meta);
```

- Enabled by default in the dev server of Vite, and off for builds.
- It relies on `import.meta.hot`.
- Calls are found through their import, renamed imports (`import { effect as e }`) and namespace imports (`import * as S`) included.
- Files that do not mention `@monstermann/signals` are skipped without being parsed.
- Built on [`@monstermann/meta`](https://github.com/MichaelOstermann/meta).
