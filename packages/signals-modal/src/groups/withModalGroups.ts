import type { Memo } from "@monstermann/signals"
import { memo } from "@monstermann/signals"
import { currentModal } from "../createModal"
import { addGroups, removeGroups } from "./internals"

/**
 * # withModalGroups
 *
 * ```ts
 * function withModalGroups(groups: Iterable<string>): Memo<ReadonlySet<string>>;
 * ```
 *
 * Assigns the current modal to a list of groups. Can be used to for example mark the modal as a dialog/popover/tooltip. This function must be called inside a `createModal` callback.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     getDialogs,
 *     getGroupsForModal,
 *     getModalsForGroup,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups(["dialog"]);
 * });
 *
 * getGroupsForModal("key"); // Set(["dialog"])
 * getModalsForGroup("dialog"); // Set(["key"])
 * ```
 *
 */
export function withModalGroups(groups: Iterable<string>): Memo<ReadonlySet<string>> {
    const modal = currentModal()
    const { created, groups: groupsOfModal } = addGroups(modal, modal.key, groups)
    if (created) modal.onDispose(() => removeGroups(modal.key, groupsOfModal))
    return memo(() => groupsOfModal)
}
