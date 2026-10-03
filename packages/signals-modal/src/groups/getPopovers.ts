import { getModalsForGroup } from "./getModalsForGroup"
import { modalGroups } from "./modalGroups"

/**
 * # getPopovers
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function getPopovers(): ReadonlySet<string>;
 * ```
 *
 * Returns all popover keys from the `modalGroups.popover` group.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     getPopovers,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.popover]);
 * });
 *
 * getPopovers(); // Set(["key"])
 * ```
 *
 */
export function getPopovers(): ReadonlySet<string> {
    return getModalsForGroup(modalGroups.popover)
}
