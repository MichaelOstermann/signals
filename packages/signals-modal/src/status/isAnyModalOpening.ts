import { getOpeningModals } from "./getOpeningModals"

/**
 * # isAnyModalOpening
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function isAnyModalOpening(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"opening"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     isAnyModalOpening,
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
 *
 * isAnyModalOpening(); // true
 * ```
 *
 */
export function isAnyModalOpening(): boolean {
    return getOpeningModals().length > 0
}
