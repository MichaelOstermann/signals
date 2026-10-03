import type { Signal } from "@monstermann/signals"
import { signal } from "@monstermann/signals"

/**
 * # withAnchorElement
 *
 * ```ts
 * function withAnchorElement(
 *     anchorElement?: HTMLElement,
 * ): Signal<HTMLElement | null>;
 * ```
 *
 * Assigns an anchor element to the current modal. This function must be called inside a `createModal` callback.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withAnchorElement,
 *     setAnchorElement,
 *     getAnchorElement,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withAnchorElement();
 * });
 *
 * setAnchorElement("key", document.querySelector(".anchor"));
 * getAnchorElement("key"); // HTMLElement
 * ```
 *
 */
export function withAnchorElement(anchorElement?: HTMLElement | null): Signal<HTMLElement | null> {
    const $anchorElement = signal(anchorElement ?? null)
    return $anchorElement
}
