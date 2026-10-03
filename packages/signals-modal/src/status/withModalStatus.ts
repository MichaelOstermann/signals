import type { Memo, Signal } from "@monstermann/signals"
import type { ModalStatus } from "./types"
import { memo, signal, watch } from "@monstermann/signals"
import { currentModal } from "../createModal"
import { closeModal } from "./closeModal"
import { keysToStatus, modalsToStatus } from "./internals"
import { onModalClosed } from "./onModalClosed"
import { onModalClosing } from "./onModalClosing"
import { onModalOpened } from "./onModalOpened"
import { onModalOpening } from "./onModalOpening"
import { openModal } from "./openModal"

/**
 * # withModalStatus
 *
 * ```ts
 * function withModalStatus(status: ModalStatus = "closed"): {
 *     $isOpen: Memo<boolean>;
 *     $mounted: Memo<boolean>;
 *     $status: Signal<ModalStatus>;
 *     close: () => void;
 *     open: () => void;
 *     toggle: () => void;
 * };
 * ```
 *
 * Creates and returns a status signal for the current modal. This function must be called inside a `createModal` callback.
 *
 * The optional `status` parameter sets the initial status of the modal (defaults to `"closed"`).
 *
 * **ModalStatus** can be one of: `"closed"`, `"opening"`, `"opened"`, or `"closing"`.
 *
 * ## Example
 *
 * ```ts
 * import { createModal, withModalStatus } from "@monstermann/signals-modal";
 *
 * // Default to "closed"
 * createModal("modal1", () => {
 *     const { $status } = withModalStatus();
 *     console.log($status()); // "closed"
 * });
 *
 * // Start with a different initial status
 * createModal("modal2", () => {
 *     const { $status } = withModalStatus("opened");
 *     console.log($status()); // "opened"
 *
 *     // Update the status
 *     $status("closing");
 * });
 * ```
 *
 */
export function withModalStatus(status: ModalStatus = "closed"): {
    $isOpen: Memo<boolean>
    $mounted: Memo<boolean>
    $status: Signal<ModalStatus>
    close: () => void
    open: () => void
    toggle: () => void
} {
    const modal = currentModal()
    const $status = signal<ModalStatus>(status)

    keysToStatus.set(modal.key, $status)
    modalsToStatus.set(modal, $status)
    modal.onDispose(() => {
        // A later modal with the same key has its own status.
        if (keysToStatus.get(modal.key) === $status) keysToStatus.delete(modal.key)
    })

    modal.onDispose(watch($status, (status) => {
        if (status === "closed") onModalClosed(modal.key)
        else if (status === "closing") onModalClosing(modal.key)
        else if (status === "opening") onModalOpening(modal.key)
        else if (status === "opened") onModalOpened(modal.key)
    }))

    const $isOpen = memo(() => {
        const s = $status()
        return s === "opening"
            || s === "opened"
    })

    return {
        $isOpen,
        $mounted: memo(() => $status() !== "closed"),
        $status,
        close: () => closeModal(modal.key),
        open: () => openModal(modal.key),
        toggle: () => {
            if ($isOpen()) closeModal(modal.key)
            else openModal(modal.key)
        },
    }
}
