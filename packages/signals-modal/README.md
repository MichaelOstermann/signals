<div align="center">

<h1>signals-modal</h1>

**Composable modal management.**

</div>

Popovers, tooltips and dialogs are put together from small pieces inside `createModal`: a status, an anchor, a floating element, where it may be placed and where it ends up.

```ts
import {
    createModal,
    withAnchorElement,
    withAnchorMeasurement,
    withBoundary,
    withFloatingElement,
    withFloatingMeasurement,
    withModalStatus,
    withPlacement,
    withPosition,
} from "@monstermann/signals-modal";

const modal = createModal("key", () => {
    const { $status } = withModalStatus();

    const $anchorElement = withAnchorElement();
    const $anchorMeasurement = withAnchorMeasurement({
        $anchorElement,
        $status,
    });

    const $floatingElement = withFloatingElement();
    const $floatingMeasurement = withFloatingMeasurement({
        $floatingElement,
        $status,
    });

    const $boundary = withBoundary({
        $status,
        transform: (rect) => rect,
    });

    const $placement = withPlacement({
        placement: "down-center",
        $anchorMeasurement,
        $boundary,
        $floatingMeasurement,
    });

    const $position = withPosition({
        $anchorMeasurement,
        $boundary,
        $floatingMeasurement,
        $placement,
    });

    return {
        $anchorElement,
        $floatingElement,
        $position,
        $status,
    };
});
```

Everything is documented with JSDoc, including examples.

## Installation

```sh
bun add @monstermann/signals @monstermann/signals-modal
```
