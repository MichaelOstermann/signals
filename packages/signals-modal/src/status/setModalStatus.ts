import type { ModalStatus } from "./types"
import { $keysToStatus } from "./internals"

/**
 * # setModalStatus
 *
 * ```ts
 * function setModalStatus(key: string, status: ModalStatus): void;
 * ```
 *
 * Sets the status of a modal. Does nothing if the modal doesn't exist.
 *
 * **ModalStatus** can be one of: `"closed"`, `"opening"`, `"opened"`, or `"closing"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     setModalStatus,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * setModalStatus("key", "opened");
 * ```
 *
 */
export function setModalStatus(key: string, status: ModalStatus): void {
    $keysToStatus().get(key)?.(status)
}
