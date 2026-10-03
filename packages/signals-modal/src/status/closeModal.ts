import { untrack } from "@monstermann/signals"
import { $keysToStatus } from "./internals"

/**
 * # closeModal
 *
 * ```ts
 * function closeModal(key: string): void;
 * ```
 *
 * Closes a modal by setting its status to `"closing"`. Does nothing if the modal is already `"closing"` or `"closed"`, or if the modal doesn't exist.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     closeModal,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * openModal("key");
 * closeModal("key");
 * ```
 *
 */
export function closeModal(key: string): void {
    untrack(() => {
        const $status = $keysToStatus().get(key)
        if (!$status) return
        if ($status() === "closing") return
        if ($status() === "closed") return
        $status("closing")
    })
}
