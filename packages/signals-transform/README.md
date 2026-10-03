<div align="center">

<h1>signals-transform</h1>

**Names the actions of `@monstermann/signals`, and disposes its effects during HMR.**

</div>

Before:

```ts
import { action, effect } from "@monstermann/signals";

const save = action(() => {});

effect(() => {});
```

After:

```ts
import { action, effect } from "@monstermann/signals";
const path = "src/save.ts";
const meta = { path: path, line: 3, name: "save" };

const save = action(() => {}, meta);

effect(() => {});
```

- Actions receive the name, path and line of where they have been created, available as `action.meta` and meant for `onAction`.
- With `hmr`, effects, watchers and emitters are disposed when the module that created them is replaced.
- Signals, memos and reducers are left alone.

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

| Option    | Default        | Description                                                                 |
| --------- | -------------- | --------------------------------------------------------------------------- |
| `hmr`     | `false`        | `true` in the dev server of Vite. Relies on `import.meta.hot`.              |
| `getName` |                | `(name) => string`, changes the name of an action.                          |
| `getPath` |                | `(path) => string`, changes the path, which is relative to `process.cwd()`. |
| `include` | `/\.[jt]sx?$/` | RegExp(s), only files whose path matches are transformed.                   |
| `exclude` |                | RegExp(s), files whose path matches are skipped.                            |
| `enforce` |                | `"pre"` or `"post"`.                                                        |

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

## Details

- Files that do not mention `@monstermann/signals` are skipped without being parsed.
- Calls are found through their import, renamed imports (`import { action as a }`) and namespace imports (`import * as S`) included.
- The name is taken from what the result is assigned to: `const save = action(…)` is `"save"`, `{ save: action(…) }` inside `const tasks` is `"tasks.save"`.
- An action that already has a second argument (`action(fn, { name: "save" })`) is left alone.
- Built on [`@monstermann/meta`](https://github.com/MichaelOstermann/meta).
