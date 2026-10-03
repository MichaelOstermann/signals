import type { Reactive } from "@monstermann/signals"
import type { ModalStatus } from "../status/types"
import { effect } from "@monstermann/signals"
import { currentModal } from "../createModal"
import { closeModal } from "../status/closeModal"

/**
 * # withCloseOnScroll
 *
 * ```ts
 * function withCloseOnScroll(options: {
 *     $anchorElement: Reactive<HTMLElement | null>;
 *     $status: Reactive<ModalStatus>;
 * }): void;
 * ```
 *
 * Automatically closes the modal when any scrollable ancestor of the anchor element is scrolled. This function must be called inside a `createModal` callback.
 *
 * The function listens for scroll events on all scrollable parent elements of the anchor element and triggers a close when scrolling occurs. Scroll listeners are only active when the modal is opening or opened (not when closing or closed).
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     withAnchorElement,
 *     withCloseOnScroll,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     const $anchorElement = withAnchorElement();
 *
 *     withCloseOnScroll({
 *         $status,
 *         $anchorElement,
 *     });
 * });
 * ```
 *
 */
export function withCloseOnScroll(options: {
    $anchorElement: Reactive<HTMLElement | null>
    $status: Reactive<ModalStatus>
}): void {
    const modal = currentModal()
    const onScroll = () => closeModal(modal.key)
    modal.onDispose(effect(() => {
        const element = options.$anchorElement()
        const status = options.$status()
        if (!element) return
        if (status === "closing" || status === "closed") return

        const overflowElements = getScrollableAncestors(element)

        for (const element of overflowElements)
            element.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            for (const element of overflowElements)
                element.removeEventListener("scroll", onScroll)
        }
    }))
}

function isOverflowElement(element: Element): boolean {
    const { display, overflow, overflowX, overflowY } = getComputedStyle(element)
    return (
        /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX)
        && !["inline", "contents"].includes(display)
    )
}

function getScrollableAncestors(element: Element): Element[] {
    const scrollableAncestors: Element[] = []
    let pivot = element.parentElement

    while (pivot) {
        if (isOverflowElement(pivot))
            scrollableAncestors.push(pivot)
        pivot = pivot.parentElement
    }

    return scrollableAncestors
}
