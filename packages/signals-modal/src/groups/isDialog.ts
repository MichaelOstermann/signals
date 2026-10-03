import { getGroupsForModal } from "./getGroupsForModal"
import { modalGroups } from "./modalGroups"

/**
 * # isDialog
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isDialog(key: string): boolean;
 * ```
 *
 * Returns a boolean indicating whether the given `key` belongs to the `modalGroups.dialog` group.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     isDialog,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.popover]);
 * });
 *
 * isDialog("key"); // true
 * ```
 *
 */
export function isDialog(key: string): boolean {
    return getGroupsForModal(key).has(modalGroups.dialog)
}
