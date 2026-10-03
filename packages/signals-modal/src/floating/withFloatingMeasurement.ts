import type { Memo } from "@monstermann/signals"
import type { ModalStatus } from "../status/types"
import { Rect } from "@monstermann/fn"
import { effect, memo, signal } from "@monstermann/signals"
import { currentModal } from "../createModal"
import { observeDimensions } from "../internals/observeDimensions"

/**
 * # withFloatingMeasurement
 *
 * ```ts
 * function withFloatingMeasurement(options: {
 *     $floatingElement: () => HTMLElement | null;
 *     $status: () => ModalStatus;
 *     transform?: (rect: Rect) => Rect;
 * }): Memo<Rect>;
 * ```
 *
 * Takes an floating element and continuously measures its position while the modal is visible, to be used to position eg. a popover next to an element. This function must be called inside a `createModal` callback.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withFloatingElement,
 *     withModalStatus,
 *     withFloatingMeasurement,
 *     setFloatingElement,
 *     setModalStatus,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     const $floatingElement = withFloatingElement();
 *     // Memo({ top: number, left: number, width: number, height: number })
 *     const $floatingMeasurement = withFloatingMeasurement({
 *         $status,
 *         $floatingElement,
 *     });
 * });
 *
 * setFloatingElement("key", document.querySelector(".floating"));
 * setModalStatus("key", "opened");
 * ```
 *
 */
export function withFloatingMeasurement(options: {
    $floatingElement: () => HTMLElement | null
    $status: () => ModalStatus
    transform?: (rect: Rect) => Rect
}): Memo<Rect> {
    const modal = currentModal()

    const $rect = signal<Rect>(Rect.origin, {
        equals: Rect.isEqual,
    })

    const $measurement = memo(() => options.transform
        ? options.transform($rect())
        : $rect())

    modal.onDispose(effect(() => {
        const element = options.$floatingElement()
        const status = options.$status()
        if (!element) return
        if (status === "closed") return
        const bounds = Rect.fromElement(element)
        $rect({
            height: bounds.height,
            left: 0,
            top: 0,
            width: bounds.width,
        })
        return observeDimensions(element, bounds => $rect({
            height: bounds.height,
            left: 0,
            top: 0,
            width: bounds.width,
        }))
    }))

    return $measurement
}
