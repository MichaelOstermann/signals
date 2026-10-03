import { keysToStatus } from "./internals"

/**
 * # isAnyModalClosing
 *
 * Reactive to the status of modals, but not to modals being created or disposed.
 *
 * ```ts
 * function isAnyModalClosing(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"closing"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     closeModal,
 *     isAnyModalClosing,
 * } from "@monstermann/signals-modal";
 *
 * createModal("modal1", () => {
 *     withModalStatus("opened");
 * });
 *
 * createModal("modal2", () => {
 *     withModalStatus();
 * });
 *
 * closeModal("modal1");
 *
 * isAnyModalClosing(); // true
 * ```
 *
 */
export function isAnyModalClosing(): boolean {
    for (const $status of keysToStatus.values()) {
        if ($status() === "closing") return true
    }
    return false
}
