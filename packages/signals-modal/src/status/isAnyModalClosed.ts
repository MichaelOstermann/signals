import { getClosedModals } from "./getClosedModals"

/**
 * # isAnyModalClosed
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function isAnyModalClosed(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"closed"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isAnyModalClosed,
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
 * isAnyModalClosed(); // true
 * ```
 *
 */
export function isAnyModalClosed(): boolean {
    return getClosedModals().length > 0
}
