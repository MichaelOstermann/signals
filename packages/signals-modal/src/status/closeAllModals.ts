import { untrack } from "@monstermann/signals"
import { $keysToStatus } from "./internals"

/**
 * # closeAllModals
 *
 * ```ts
 * function closeAllModals(): void;
 * ```
 *
 * Closes all modals by setting their status to `"closing"`. Skips modals that are already `"closing"` or `"closed"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     closeAllModals,
 * } from "@monstermann/signals-modal";
 *
 * createModal("modal1", () => {
 *     withModalStatus();
 * });
 *
 * createModal("modal2", () => {
 *     withModalStatus();
 * });
 *
 * openModal("modal1");
 * openModal("modal2");
 * closeAllModals();
 * ```
 *
 */
export function closeAllModals(): void {
    untrack(() => {
        for (const $status of $keysToStatus().values()) {
            if ($status() === "closed") continue
            if ($status() === "closing") continue
            $status("closing")
        }
    })
}
