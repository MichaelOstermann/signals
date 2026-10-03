<div align="center">

<h1>signals</h1>

**A signals library.**

</div>

| Package                                                          | Description                                                                |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`@monstermann/signals`](./packages/signals)                     | The library.                                                               |
| [`@monstermann/signals-transform`](./packages/signals-transform) | Names actions, disposes effects during HMR and writes useSignal for React. |
| [`@monstermann/signals-react`](./packages/signals-react)         | React integration for @monstermann/signals.                                |
| [`@monstermann/signals-modal`](./packages/signals-modal)         | Composable modal management.                                               |

## Development

```sh
bun install
bun run bundles
bun run checks
```

The packages use each other through their builds, so `bundles` comes first.
