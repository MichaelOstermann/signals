import { $keysToStatus } from "./internals"

/**
 * # isModalClosed
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function isModalClosed(key: string): boolean;
 * ```
 *
 * Returns `true` if the modal's status is `"closed"` or if the modal doesn't exist.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isModalClosed,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * isModalClosed("key"); // true
 * ```
 *
 */
export function isModalClosed(key: string): boolean {
    const $status = $keysToStatus().get(key)
    return $status === undefined || $status() === "closed"
}
