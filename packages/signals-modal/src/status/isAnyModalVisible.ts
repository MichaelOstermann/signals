import { keysToStatus } from "./internals"

/**
 * # isAnyModalVisible
 *
 * Reactive to the status of modals, but not to modals being created or disposed.
 *
 * ```ts
 * function isAnyModalVisible(): boolean;
 * ```
 *
 * Returns `true` if any modal is visible (not `"closed"`). This includes `"opening"`, `"opened"`, and `"closing"` statuses.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isAnyModalVisible,
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
 * isAnyModalVisible(); // true
 * ```
 *
 */
export function isAnyModalVisible(): boolean {
    for (const $status of keysToStatus.values()) {
        if ($status() !== "closed") return true
    }
    return false
}
