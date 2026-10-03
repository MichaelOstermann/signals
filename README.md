<div align="center">

<h1>signals</h1>

**A signals library.**

</div>

| Package                                                                      | Description                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`@monstermann/signals`](./packages/signals)                                 | The library.                                                                   |
| [`@monstermann/signals-transform`](./packages/signals-transform)             | Names the actions of @monstermann/signals and disposes its effects during HMR. |
| [`@monstermann/signals-react`](./packages/signals-react)                     | React integration for @monstermann/signals.                                    |
| [`@monstermann/signals-react-transform`](./packages/signals-react-transform) | Wraps reads of signals in React components with useSignal.                     |
| [`@monstermann/signals-modal`](./packages/signals-modal)                     | Composable modal management.                                                   |

## Development

```sh
bun install
bun run bundles
bun run checks
```

The packages use each other through their builds, so `bundles` comes first.
