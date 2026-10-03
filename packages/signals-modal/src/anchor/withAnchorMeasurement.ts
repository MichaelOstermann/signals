import type { Memo, Reactive } from "@monstermann/signals"
import type { ModalStatus } from "../status/types"
import { Rect } from "@monstermann/fn"
import { effect, memo, signal } from "@monstermann/signals"
import { currentModal } from "../createModal"
import { observePosition } from "../internals/observePosition"

/**
 * # withAnchorMeasurement
 *
 * ```ts
 * function withAnchorMeasurement(options: {
 *     $anchorElement: Reactive<HTMLElement | null>;
 *     $status: Reactive<ModalStatus>;
 *     transform?: (rect: Rect) => Rect;
 * }): Memo<Rect>;
 * ```
 *
 * Takes an anchor element and continuously measures its position while the modal is visible, to be used to position eg. a popover next to an element. This function must be called inside a `createModal` callback.
 *
 * The optional `transform` option can be used to eg. make the anchor bigger, resulting with a margin between the anchor and floating popover.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withAnchorElement,
 *     withModalStatus,
 *     withAnchorMeasurement,
 *     setAnchorElement,
 *     setModalStatus,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     const $anchorElement = withAnchorElement();
 *     // Memo({ top: number, left: number, width: number, height: number })
 *     const $anchorMeasurement = withAnchorMeasurement({
 *         $status,
 *         $anchorElement,
 *     });
 * });
 *
 * setAnchorElement("key", document.querySelector(".anchor"));
 * setModalStatus("key", "opened");
 * ```
 *
 */
export function withAnchorMeasurement(options: {
    $anchorElement: Reactive<HTMLElement | null>
    $status: Reactive<ModalStatus>
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
        const element = options.$anchorElement()
        const status = options.$status()
        if (!element) return
        if (status === "closed") return
        $rect(Rect.fromElement(element))
        return observePosition(element, bounds => $rect(Rect.fromDOMRect(bounds)))
    }))

    return $measurement
}
