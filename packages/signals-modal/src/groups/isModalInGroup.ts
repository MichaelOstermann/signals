import { getGroupsForModal } from "./getGroupsForModal"

/**
 * # isModalInGroup
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function isModalInGroup(key: string, group: string): boolean;
 * ```
 *
 * Returns a boolean indicating whether the given `key` belongs to the `group`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     isModalInGroup,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.popover]);
 * });
 *
 * isModalInGroup("key", modalGroups.popover); // true
 * ```
 *
 */
export function isModalInGroup(key: string, group: string): boolean {
    return getGroupsForModal(key).has(group)
}
