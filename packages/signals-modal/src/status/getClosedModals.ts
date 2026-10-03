import { $keysToStatus } from "./internals"

/**
 * # getClosedModals
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function getClosedModals(): string[];
 * ```
 *
 * Returns an array of all modal keys with status `"closed"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     getClosedModals,
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
 * getClosedModals(); // ["modal1", "modal2"]
 * ```
 *
 */
export function getClosedModals(): string[] {
    const result: string[] = []
    const map = $keysToStatus()
    for (const [key, $status] of map) {
        if ($status() === "closed") result.push(key)
    }
    return result
}
