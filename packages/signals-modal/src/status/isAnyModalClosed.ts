import { keysToStatus } from "./internals"

/**
 * # isAnyModalClosed
 *
 * Reactive to the status of modals, but not to modals being created or disposed.
 *
 * ```ts
 * function isAnyModalClosed(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"closed"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isAnyModalClosed,
 * } from "@monstermann/signals-modal";
 *
 * createModal("modal1", () => {
 *     withModalStatus();
 * });
 *
 * createModal("modal2", () => {
 *     withModalStatus("opened");
 * });
 *
 * isAnyModalClosed(); // true
 * ```
 *
 */
export function isAnyModalClosed(): boolean {
    for (const $status of keysToStatus.values()) {
        if ($status() === "closed") return true
    }
    return false
}
