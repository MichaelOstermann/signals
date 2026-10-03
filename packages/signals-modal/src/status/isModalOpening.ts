import { $keysToStatus } from "./internals"

/**
 * # isModalOpening
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isModalOpening(key: string): boolean;
 * ```
 *
 * Returns `true` if the modal's status is `"opening"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     isModalOpening,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * openModal("key");
 * isModalOpening("key"); // true
 * ```
 *
 */
export function isModalOpening(key: string): boolean {
    return $keysToStatus().get(key)?.() === "opening"
}
