import { $keysToStatus } from "./internals"

/**
 * # getVisibleModals
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function getVisibleModals(): string[];
 * ```
 *
 * Returns an array of all modal keys that are visible (not `"closed"`). This includes `"opening"`, `"opened"`, and `"closing"` statuses.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     getVisibleModals,
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
 * openModal("modal2");
 *
 * getVisibleModals(); // ["modal1", "modal2"]
 * ```
 *
 */
export function getVisibleModals(): string[] {
    const result: string[] = []
    const map = $keysToStatus()
    for (const [key, $status] of map) {
        if ($status() !== "closed") result.push(key)
    }
    return result
}
