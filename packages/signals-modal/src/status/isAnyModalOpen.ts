import { getOpenModals } from "./getOpenModals"

/**
 * # isAnyModalOpen
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function isAnyModalOpen(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"opening"` or `"opened"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isAnyModalOpen,
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
 * isAnyModalOpen(); // true
 * ```
 *
 */
export function isAnyModalOpen(): boolean {
    return getOpenModals().length > 0
}
