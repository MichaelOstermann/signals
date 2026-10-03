import { getGroupsForModal } from "./getGroupsForModal"
import { modalGroups } from "./modalGroups"

/**
 * # isTooltip
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function isTooltip(key: string): boolean;
 * ```
 *
 * Returns a boolean indicating whether the given `key` belongs to the `modalGroups.tooltip` group.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     isTooltip,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.popover]);
 * });
 *
 * isTooltip("key"); // true
 * ```
 *
 */
export function isTooltip(key: string): boolean {
    return getGroupsForModal(key).has(modalGroups.tooltip)
}
