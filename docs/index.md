---
aside: true
---

# signals

<Badge type="info" class="size">
    <span>Minified</span>
    <span>15.71 KB</span>
</Badge>

<Badge type="info" class="size">
    <span>Minzipped</span>
    <span>4.82 KB</span>
</Badge>

A fork of [`@preact/signals-core`](https://github.com/preactjs/signals) with a series of useful additions and a stronger focus on debugging tools.

## Meta

This library features an [unplugin](https://github.com/unjs/unplugin) that decorates code with additional metadata and hot module reloading setups, using the fast [Oxidation Compiler](https://oxc.rs/).

In combination with [debugging events](./Debugging/onDevHook) this can greatly help with debugging, or things such as measuring performance.

::: code-group

```ts [Example]
import { signal } from "@monstermann/signals";

const count = signal(0);

console.log(count.meta); // [!code highlight]
```

```ts [Meta]
type Meta = {
    // A name for this entity, as determined by unplugin-signals.
    // It will derive this by looking at variable names, object keys, etc.,
    // but it can also be manually configured.
    name: string;
    // The file path to this entity.
    path: string;
    // The line number of this entity.
    line: number;
    // A globally incremented id that can be used to reference this entity.
    id: number;
    // Whether this entity should be considered to be an implementation detail.
    // If set to `true`, it will not emit any debugging events, and will not be
    // accessible by eg. `getSignals()`. Takes precedence over `silent`.
    internal: boolean;
    // Whether this entity should emit any debugging events.
    silent: boolean;
    // A generic name for this entity, eg. `Signal`, `Memo`, `Effect`.
    kind: string;
};
```

:::

## Installation

::: code-group

```sh [npm]
npm install @monstermann/signals
```

```sh [pnpm]
pnpm add @monstermann/signals
```

```sh [yarn]
yarn add @monstermann/signals
```

```sh [bun]
bun add @monstermann/signals
```

:::

## Unplugin

### Installation

::: code-group

```sh [npm]
npm install -D @monstermann/unplugin-signals
```

```sh [pnpm]
pnpm -D add @monstermann/unplugin-signals
```

```sh [yarn]
yarn -D add @monstermann/unplugin-signals
```

```sh [bun]
bun -D add @monstermann/unplugin-signals
```

:::

### Usage

::: code-group

```ts [Vite]
// vite.config.ts
import signals from "@monstermann/unplugin-signals/vite";

export default defineConfig({
    plugins: [signals()],
});
```

```ts [Rollup]
// rollup.config.js
import signals from "@monstermann/unplugin-signals/rollup";

export default {
    plugins: [signals()],
};
```

```ts [Rolldown]
// rolldown.config.js
import signals from "@monstermann/unplugin-signals/rolldown";

export default {
    plugins: [signals()],
};
```

```ts [Webpack]
// webpack.config.js
const signals = require("@monstermann/unplugin-signals/webpack");

module.exports = {
    plugins: [signals()],
};
```

```ts [Rspack]
// rspack.config.js
const signals = require("@monstermann/unplugin-signals/rspack");

module.exports = {
    plugins: [signals()],
};
```

```ts [ESBuild]
// esbuild.config.js
import { build } from "esbuild";
import signals from "@monstermann/unplugin-signals/esbuild";

build({
    plugins: [signals()],
});
```

:::

### Options

See [`@monstermann/meta`](https://michaelostermann.github.io/meta/#options) for a description of these options.

```ts
{
    enforce?: "post" | "pre" | undefined
    exclude?: FilterPattern
    include?: FilterPattern
    hmr?: boolean;
    getName?: (name: string, node: Node, meta: Meta) => string;
    getPath?: (path: string, meta: Meta) => string;
}
```
