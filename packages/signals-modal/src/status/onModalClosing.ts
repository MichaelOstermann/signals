import { emitter } from "@monstermann/signals"

/**
 * # onModalClosing
 *
 * ```ts
 * const onModalClosing: Emitter<string>;
 * ```
 *
 * An emitter that fires when a modal transitions to the `"closing"` status. The emitted value is the modal key.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     onModalClosing,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * const stopListening = onModalClosing((key) => {
 *     console.log(`Modal ${key} closing`);
 * });
 *
 * stopListening();
 * ```
 *
 */
export const onModalClosing = emitter<string>()
