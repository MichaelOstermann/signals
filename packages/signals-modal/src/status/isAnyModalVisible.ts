import { getVisibleModals } from "./getVisibleModals"

/**
 * # isAnyModalVisible
 *
 * <Badge type="tip">Reactive</Badge>
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
    return getVisibleModals().length > 0
}
