import type { Memo } from "@monstermann/signals"
import type { ModalStatus } from "../status/types"
import { Rect } from "@monstermann/fn"
import { effect, memo, signal } from "@monstermann/signals"
import { currentModal } from "../createModal"
import { getMousePosition, trackMousePosition } from "../internals/mousePosition"

/**
 * # withMouseAnchor
 *
 * ```ts
 * function withMouseAnchor(options: {
 *     $status: () => ModalStatus;
 *     transform?: (rect: Rect) => Rect;
 * }): Memo<Rect>;
 * ```
 *
 * This can be used to make the mouse cursor the anchor, instead of an element. This function must be called inside a `createModal` callback.
 *
 * The position of the mouse is tracked with a single `mousemove` listener on the document, for as long as a modal using this exists.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     withMouseAnchor,
 *     setModalStatus,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     // Memo({ top: number, left: number, width: number, height: number })
 *     const $anchorMeasurement = withMouseAnchor({ $status });
 * });
 *
 * // Updates $anchorMeasurement to the current mouse coordinates (once).
 * setModalStatus("key", "opened");
 * ```
 *
 */
export function withMouseAnchor(options: {
    $status: () => ModalStatus
    transform?: (rect: Rect) => Rect
}): Memo<Rect> {
    const modal = currentModal()

    const $rect = signal(Rect.origin, {
        equals: Rect.isEqual,
    })

    const $measurement = memo(() => options.transform
        ? options.transform($rect())
        : $rect())

    modal.onDispose(trackMousePosition())

    modal.onDispose(effect(() => {
        if (options.$status() === "closed") {
            $rect(Rect.origin)
        }
        else if (Rect.isOrigin($rect())) {
            const { x, y } = getMousePosition()
            $rect({
                height: 0,
                left: x,
                top: y,
                width: 0,
            })
        }
    }))

    return $measurement
}
