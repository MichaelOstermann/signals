import { isModalClosed } from "./isModalClosed"

/**
 * # isModalVisible
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isModalVisible(key: string): boolean;
 * ```
 *
 * Returns `true` if the modal is visible (not `"closed"`). This includes `"opening"`, `"opened"`, and `"closing"` statuses.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     isModalVisible,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * openModal("key");
 * isModalVisible("key"); // true
 * ```
 *
 */
export function isModalVisible(key: string): boolean {
    return !isModalClosed(key)
}
