import { $keysToStatus } from "./internals"

/**
 * # getOpenedModals
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function getOpenedModals(): string[];
 * ```
 *
 * Returns an array of all modal keys with status `"opened"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     getOpenedModals,
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
 * getOpenedModals(); // ["modal1", "modal2"]
 * ```
 *
 */
export function getOpenedModals(): string[] {
    const result: string[] = []
    const map = $keysToStatus()
    for (const [key, $status] of map) {
        if ($status() === "opened") result.push(key)
    }
    return result
}
