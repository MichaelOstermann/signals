import { getOpenedModals } from "./getOpenedModals"

/**
 * # isAnyModalOpened
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isAnyModalOpened(): boolean;
 * ```
 *
 * Returns `true` if any modal has status `"opened"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     isAnyModalOpened,
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
 * isAnyModalOpened(); // true
 * ```
 *
 */
export function isAnyModalOpened(): boolean {
    return getOpenedModals().length > 0
}
