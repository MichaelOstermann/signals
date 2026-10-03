import { keysToStatus } from "./internals"

/**
 * # isAnyModalOpening
 *
 * Reactive to the status of modals, but not to modals being created or disposed.
 *
 * ```ts
 * function isAnyModalOpening(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"opening"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     isAnyModalOpening,
 * } from "@monstermann/signals-modal";
 *
 * createModal("modal1", () => {
 *     withModalStatus();
 * });
 *
 * createModal("modal2", () => {
 *     withModalStatus();
 * });
 *
 * openModal("modal1");
 *
 * isAnyModalOpening(); // true
 * ```
 *
 */
export function isAnyModalOpening(): boolean {
    for (const $status of keysToStatus.values()) {
        if ($status() === "opening") return true
    }
    return false
}
