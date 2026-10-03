import { getGroupsForModal } from "./getGroupsForModal"
import { modalGroups } from "./modalGroups"

/**
 * # isPopover
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isPopover(key: string): boolean;
 * ```
 *
 * Returns a boolean indicating whether the given `key` belongs to the `modalGroups.popover` group.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     isPopover,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.popover]);
 * });
 *
 * isPopover("key"); // true
 * ```
 *
 */
export function isPopover(key: string): boolean {
    return getGroupsForModal(key).has(modalGroups.popover)
}
