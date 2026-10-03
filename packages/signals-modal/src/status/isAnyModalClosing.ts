import { getClosingModals } from "./getClosingModals"

/**
 * # isAnyModalClosing
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isAnyModalClosing(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"closing"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     closeModal,
 *     isAnyModalClosing,
 * } from "@monstermann/signals-modal";
 *
 * createModal("modal1", () => {
 *     withModalStatus("opened");
 * });
 *
 * createModal("modal2", () => {
 *     withModalStatus();
 * });
 *
 * closeModal("modal1");
 *
 * isAnyModalClosing(); // true
 * ```
 *
 */
export function isAnyModalClosing(): boolean {
    return getClosingModals().length > 0
}
