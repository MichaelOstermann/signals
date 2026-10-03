import type { Memo } from "@monstermann/signals"
import { Rect } from "@monstermann/fn"
import { memo } from "@monstermann/signals"
import { getBoundaryDown, getBoundaryLeft, getBoundaryRight, getBoundaryUp } from "./internals"

export type ModalPlacementOption =
    | "vertical-center"
    | "vertical-left"
    | "vertical-right"
    | "horizontal-center"
    | "horizontal-up"
    | "horizontal-down"
    | "up-center"
    | "down-center"
    | "left-down"
    | "right-down"

export type ModalPlacement =
    | "down-center"
    | "down-left"
    | "down-right"
    | "left-center"
    | "left-down"
    | "left-up"
    | "right-center"
    | "right-down"
    | "right-up"
    | "up-center"
    | "up-left"
    | "up-right"

interface PlacementResolver {
    (options: { anchor: Rect, boundary: Rect, floating: Rect }): ModalPlacement
}

type PlacementResolvers = Record<ModalPlacementOption, PlacementResolver>

const placementResolvers: PlacementResolvers = {
    "down-center": () => "down-center",
    "left-down": () => "left-down",
    "right-down": () => "right-down",
    "up-center": () => "up-center",
    "horizontal-center": function (o) {
        const left = getBoundaryLeft(o.boundary, o.anchor)
        const right = getBoundaryRight(o.boundary, o.anchor)
        return Rect.width(right) >= Rect.width(left)
            ? "right-center"
            : "left-center"
    },
    "horizontal-down": function (o) {
        const left = getBoundaryLeft(o.boundary, o.anchor)
        const right = getBoundaryRight(o.boundary, o.anchor)
        return Rect.width(right) >= Rect.width(left)
            ? "right-down"
            : "left-down"
    },
    "horizontal-up": function (o) {
        const left = getBoundaryLeft(o.boundary, o.anchor)
        const right = getBoundaryRight(o.boundary, o.anchor)
        return Rect.width(right) >= Rect.width(left)
            ? "right-up"
            : "left-up"
    },
    "vertical-center": function (o) {
        const up = getBoundaryUp(o.boundary, o.anchor)
        const down = getBoundaryDown(o.boundary, o.anchor)
        return Rect.height(down) >= Rect.height(up)
            ? "down-center"
            : "up-center"
    },
    "vertical-left": function (o) {
        const up = getBoundaryUp(o.boundary, o.anchor)
        const down = getBoundaryDown(o.boundary, o.anchor)
        return Rect.height(down) >= Rect.height(up)
            ? "down-left"
            : "up-left"
    },
    "vertical-right": function (o) {
        const up = getBoundaryUp(o.boundary, o.anchor)
        const down = getBoundaryDown(o.boundary, o.anchor)
        return Rect.height(down) >= Rect.height(up)
            ? "down-right"
            : "up-right"
    },
}

/**
 * # withPlacement
 *
 * ```ts
 * function withPlacement(options: {
 *     placement: ModalPlacementOption;
 *     $boundary: () => Rect;
 *     $anchorMeasurement: () => Rect;
 *     $floatingMeasurement: () => Rect;
 * }): Memo<ModalPlacement>;
 *
 * type ModalPlacementOption =
 *     | "vertical-center"
 *     | "vertical-left"
 *     | "vertical-right"
 *     | "horizontal-center"
 *     | "horizontal-up"
 *     | "horizontal-down"
 *     | "up-center"
 *     | "down-center"
 *     | "left-down"
 *     | "right-down";
 *
 * type ModalPlacement =
 *     | "down-center"
 *     | "down-left"
 *     | "down-right"
 *     | "left-center"
 *     | "left-down"
 *     | "left-up"
 *     | "right-center"
 *     | "right-down"
 *     | "right-up"
 *     | "up-center"
 *     | "up-left"
 *     | "up-right";
 * ```
 *
 * Takes a `ModalPlacementOption` and resolves it to `ModalPlacement`, picking whichever side has more space. This function must be called inside a `createModal` callback.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     withAnchorElement,
 *     withAnchorMeasurement,
 *     withFloatingElement,
 *     withFloatingMeasurement,
 *     withBoundary,
 *     withPlacement,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     const $anchorElement = withAnchorElement();
 *     const $floatingElement = withFloatingElement();
 *     const $anchorMeasurement = withAnchorMeasurement({
 *         $status,
 *         $anchorElement,
 *     });
 *     const $floatingMeasurement = withFloatingMeasurement({
 *         $status,
 *         $floatingElement,
 *     });
 *     const $boundary = withBoundary({ $status });
 *     const $placement = withPlacement({
 *         placement: "vertical-center",
 *         $boundary,
 *         $anchorMeasurement,
 *         $floatingMeasurement,
 *     });
 * });
 * ```
 *
 */
export function withPlacement(options: {
    placement: ModalPlacementOption
    $anchorMeasurement: () => Rect
    $boundary: () => Rect
    $floatingMeasurement: () => Rect
}): Memo<ModalPlacement> {
    // TODO static
    const $placement = memo(() => {
        return placementResolvers[options.placement]({
            anchor: options.$anchorMeasurement(),
            boundary: options.$boundary(),
            floating: options.$floatingMeasurement(),
        })
    })

    return $placement
}
