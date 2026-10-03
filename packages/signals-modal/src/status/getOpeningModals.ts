import { $keysToStatus } from "./internals"

/**
 * # getOpeningModals
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function getOpeningModals(): string[];
 * ```
 *
 * Returns an array of all modal keys with status `"opening"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     getOpeningModals,
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
 * getOpeningModals(); // ["modal1", "modal2"]
 * ```
 *
 */
export function getOpeningModals(): string[] {
    const result: string[] = []
    const map = $keysToStatus()
    for (const [key, $status] of map) {
        if ($status() === "opening") result.push(key)
    }
    return result
}
