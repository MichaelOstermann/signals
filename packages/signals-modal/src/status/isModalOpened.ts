import { keysToStatus } from "./internals"

/**
 * # isModalOpened
 *
 * Reactive to the status of modals, but not to modals being created or disposed.
 *
 * ```ts
 * function isModalOpened(key: string): boolean;
 * ```
 *
 * Returns `true` if the modal's status is `"opened"`.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     openModal,
 *     isModalOpened,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     const { $status } = withModalStatus();
 *     $status("opened");
 * });
 *
 * isModalOpened("key"); // true
 * ```
 *
 */
export function isModalOpened(key: string): boolean {
    return keysToStatus.get(key)?.() === "opened"
}
