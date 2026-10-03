import { getModalsForGroup } from "./getModalsForGroup"
import { modalGroups } from "./modalGroups"

/**
 * # getTooltips
 *
 * <Badge type="tip">Reactive</Badge>
 *
 * ```ts
 * function getTooltips(): ReadonlySet<string>;
 * ```
 *
 * Returns all tooltip keys from the `modalGroups.tooltip` group.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalGroups,
 *     modalGroups,
 *     getTooltips,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalGroups([modalGroups.tooltip]);
 * });
 *
 * getTooltips(); // Set(["key"])
 * ```
 *
 */
export function getTooltips(): ReadonlySet<string> {
    return getModalsForGroup(modalGroups.tooltip)
}
