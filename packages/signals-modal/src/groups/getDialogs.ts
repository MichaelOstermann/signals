import { getModalsForGroup } from "./getModalsForGroup"
import { modalGroups } from "./modalGroups"

/**
 * # getDialogs
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function getDialogs(): ReadonlySet<string>;
 * ```
 *
 * Returns all dialog keys from the `modalGroups.dialog` group.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     getDialogs,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.dialog]);
 * });
 *
 * getDialogs(); // Set(["key"])
 * ```
 *
 */
export function getDialogs(): ReadonlySet<string> {
    return getModalsForGroup(modalGroups.dialog)
}
