<div align="center">

<h1>signals</h1>

**A signals library.**

</div>

A fork of [`@preact/signals-core`](https://github.com/preactjs/signals) where signals are functions, with a couple of additions.

```ts
import { action, batch, effect, memo, signal } from "@monstermann/signals";

const count = signal(0);
const double = memo(() => count() * 2);

const dispose = effect(() => {
    console.log(count(), double());
});

// Read, write, transform:
count();
count(1);
count((n) => n + 1);

// Update several signals at once:
batch(() => {
    count(3);
    count(4);
});

// Batched and untracked functions:
const increment = action((by: number) => count((n) => n + by));

dispose();
```

## Installation

```sh
bun add @monstermann/signals
```

## API

Everything is documented with JSDoc, including examples.

|           |                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------- |
| State     | `signal`, `memo`, `indexed`, `reducer`                                                          |
| Reactions | `effect`, `deferEffect`, `watch`, `onCleanup`                                                   |
| Actions   | `action`                                                                                        |
| Events    | `emitter`                                                                                       |
| Disposal  | `disposer`, `dispose`, `onDispose`, `isDisposed`, `disposed`, `mixinDisposer`                   |
| Batching  | `batch`, `startBatch`, `endBatch`, `isBatching`                                                 |
| Tracking  | `untrack`, `peek`, `pauseTracking`, `resumeTracking`                                            |
| Running   | `hasEffect`, `currentEffect`, `disposeEffect`, `hasWatcher`, `currentWatcher`, `disposeWatcher` |
| Other     | `context`, `RawSignal`, `RawMemo`, `RawEffect`                                                  |

## HMR

[`@monstermann/signals-transform`](../signals-transform) disposes effects, watchers and emitters when their module is replaced during development.
