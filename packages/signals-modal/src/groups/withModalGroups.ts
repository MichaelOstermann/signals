import type { Memo } from "@monstermann/signals"
import { memo } from "@monstermann/signals"
import { currentModal } from "../createModal"
import { getGroupsForModal } from "./getGroupsForModal"
import { $keysToGroups } from "./internals"

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

    $keysToGroups((keys) => {
        if (!keys.has(modal.key)) keys.set(modal.key, new Set())
        const g = keys.get(modal.key)!
        for (const group of groups) g.add(group)
        return keys
    })

    modal.onDispose(() => {
        $keysToGroups((keys) => {
            keys.delete(modal.key)
            return keys
        })
    })

    return memo(() => getGroupsForModal(modal.key))
}
