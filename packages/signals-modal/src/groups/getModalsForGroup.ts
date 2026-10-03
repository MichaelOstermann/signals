import { groupsToKeys } from "./internals"

const empty: ReadonlySet<string> = new Set()

/**
 * # getModalsForGroup
 *
 * ```ts
 * function getModalsForGroup(group: string): ReadonlySet<string>;
 * ```
 *
 * Returns the keys of all modals in the given `group`. The set is kept up to date as modals are created and disposed, but reading it does not subscribe to that.
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
    return groupsToKeys.get(group) ?? empty
}
