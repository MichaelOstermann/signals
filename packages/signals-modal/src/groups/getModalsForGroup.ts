import { $groupsToKeys } from "./internals"

const empty: ReadonlySet<string> = new Set()

/**
 * # getModalsForGroup
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function getModalsForGroup(group: string): ReadonlySet<string>;
 * ```
 *
 * Returns all keys the given `group` belongs to.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     getModalsForGroup,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.dialog]);
 * });
 *
 * getModalsForGroup(modalGroups.dialog); // Set(["key"])
 * ```
 *
 */
export function getModalsForGroup(group: string): ReadonlySet<string> {
    return $groupsToKeys().get(group) ?? empty
}
