import type { Memo } from "@monstermann/signals"
import type { ModalStatus } from "../status/types"
import { Rect } from "@monstermann/fn"
import { effect, memo, signal } from "@monstermann/signals"
import { currentModal } from "../createModal"

/**
 * # withBoundary
 *
 * ```ts
 * function withBoundary(options: {
 *     $status: () => ModalStatus;
 *     transform?: (rect: Rect) => Rect;
 * }): Memo<Rect>;
 * ```
 *
 * Constructs a `Rect` resembling the window dimensions, to be fed into `withPlacement` and `withPosition`, used to constrain the floating element to be within the window boundary. This function must be called inside a `createModal` callback.
 *
 * The optional `transform` option can be used to eg. make the `Rect` smaller, increasing the distance between the floating element and the edges of the window.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     withBoundary,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     const $boundary = withBoundary({ $status });
 * });
 * ```
 *
 */
export function withBoundary(options: {
    $status: () => ModalStatus
    transform?: (rect: Rect) => Rect
}): Memo<Rect> {
    const modal = currentModal()

    const $rect = signal(Rect.origin, {
        equals: Rect.isEqual,
    })

    const $boundary = memo(() => options.transform
        ? options.transform($rect())
        : $rect())

    modal.onDispose(effect(() => {
        if (options.$status() === "closed") return
        const ac = new AbortController()
        $rect(Rect.fromWindow())
        window.addEventListener("resize", () => {
            $rect(Rect.fromWindow())
        }, { passive: true, signal: ac.signal })
        return () => ac.abort()
    }))

    return $boundary
}
