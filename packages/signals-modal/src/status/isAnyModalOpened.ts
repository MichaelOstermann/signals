import { keysToStatus } from "./internals"

/**
 * # isAnyModalOpened
 *
 * Reactive to the status of modals, but not to modals being created or disposed.
 *
 * ```ts
 * function isAnyModalOpened(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"opened"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isAnyModalOpened,
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
 * isAnyModalOpened(); // true
 * ```
 *
 */
export function isAnyModalOpened(): boolean {
    for (const $status of keysToStatus.values()) {
        if ($status() === "opened") return true
    }
    return false
}
