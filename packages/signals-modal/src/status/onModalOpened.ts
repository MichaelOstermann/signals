import { emitter } from "@monstermann/signals"

/**
 * # onModalOpened
 *
 * ```ts
 * const onModalOpened: Emitter<string>;
 * ```
 *
 * An emitter that fires when a modal transitions to the `"opened"` status. The emitted value is the modal key.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     onModalOpened,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * const stopListening = onModalOpened((key) => {
 *     console.log(`Modal ${key} opened`);
 * });
 *
 * stopListening();
 * ```
 *
 */
export const onModalOpened = emitter<string>()
