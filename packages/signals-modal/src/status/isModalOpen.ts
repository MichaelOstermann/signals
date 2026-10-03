import { isModalOpened } from "./isModalOpened"
import { isModalOpening } from "./isModalOpening"

/**
 * # isModalOpen
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isModalOpen(key: string): boolean;
 * ```
 *
 * Returns `true` if the modal's status is `"opening"` or `"opened"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isModalOpen,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus("opening");
 * });
 *
 * isModalOpen("key"); // true
 * ```
 *
 */
export function isModalOpen(key: string): boolean {
    return isModalOpening(key)
        || isModalOpened(key)
}
