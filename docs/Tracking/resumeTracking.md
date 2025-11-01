# resumeTracking

```ts
function resumeTracking(): void;
```

Similar to [`untrack`](./untrack), but allows you to manually control when tracking should be resumed.

## Example

```ts
import {
    signal,
    effect,
    stopTracking,
    resumeTracking,
} from "@monstermann/signals";

const a = signal(0);
const b = signal(0);

effect(() => {
    console.log(a());
    stopTracking();
    try {
        console.log(b());
    } finally {
        resumeTracking();
    }
});

// Prints: 1, 0
a(1);

// No effect:
b(1);
```
