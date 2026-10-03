import { $keysToStatus } from "./internals"

/**
 * # isModalOpened
 *
 * Reactive: subscribes when read inside an effect, memo or component.
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
    return $keysToStatus().get(key)?.() === "opened"
}
