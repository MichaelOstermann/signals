import { keysToStatus } from "./internals"

/**
 * # isAnyModalOpen
 *
 * Reactive to the status of modals, but not to modals being created or disposed.
 *
 * ```ts
 * function isAnyModalOpen(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"opening"` or `"opened"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isAnyModalOpen,
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
 * isAnyModalOpen(); // true
 * ```
 *
 */
export function isAnyModalOpen(): boolean {
    for (const $status of keysToStatus.values()) {
        const status = $status()
        if (status === "opening" || status === "opened") return true
    }
    return false
}
