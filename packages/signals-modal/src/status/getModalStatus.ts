import type { ModalStatus } from "./types"
import { $keysToStatus } from "./internals"

/**
 * # getModalStatus
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function getModalStatus(key: string): ModalStatus;
 * ```
 *
 * Retrieves the current status of a modal. Returns `"closed"` if the modal doesn't exist.
 *
 * **ModalStatus** can be one of: `"closed"`, `"opening"`, `"opened"`, or `"closing"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     getModalStatus,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * getModalStatus("key"); // "closed"
 * ```
 *
 */
export function getModalStatus(key: string): ModalStatus {
    return $keysToStatus().get(key)?.() ?? "closed"
}
