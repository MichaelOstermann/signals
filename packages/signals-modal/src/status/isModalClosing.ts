import { $keysToStatus } from "./internals"

/**
 * # isModalClosing
 *
 * Reactive: subscribes when read inside an effect, memo or component.
 *
 * ```ts
 * function isModalClosing(key: string): boolean;
 * ```
 *
 * Returns `true` if the modal's status is `"closing"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     closeModal,
 *     isModalClosing,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     $status("opened");
 * });
 *
 * closeModal("key");
 * isModalClosing("key"); // true
 * ```
 *
 */
export function isModalClosing(key: string): boolean {
    return $keysToStatus().get(key)?.() === "closing"
}
