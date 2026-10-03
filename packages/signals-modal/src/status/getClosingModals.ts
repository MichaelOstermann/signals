import { $keysToStatus } from "./internals"

/**
 * # getClosingModals
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function getClosingModals(): string[];
 * ```
 *
 * Returns an array of all modal keys with status `"closing"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     closeModal,
 *     getClosingModals,
 * } from "@monstermann/signals-modal";
 *
 * createModal("modal1", () => {
 *     withModalStatus("opened");
 * });
 *
 * createModal("modal2", () => {
 *     withModalStatus("opened");
 * });
 *
 * closeModal("modal1");
 * closeModal("modal2");
 *
 * getClosingModals(); // ["modal1", "modal2"]
 * ```
 *
 */
export function getClosingModals(): string[] {
    const result: string[] = []
    const map = $keysToStatus()
    for (const [key, $status] of map) {
        if ($status() === "closing") result.push(key)
    }
    return result
}
