import { emitter } from "@monstermann/signals"

/**
 * # onModalOpening
 *
 * ```ts
 * const onModalOpening: Emitter<string>;
 * ```
 *
 * An emitter that fires when a modal transitions to the `"opening"` status. The emitted value is the modal key.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     onModalOpening,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * const stopListening = onModalOpening((key) => {
 *     console.log(`Modal ${key} opening`);
 * });
 *
 * stopListening();
 * ```
 *
 */
export const onModalOpening = emitter<string>()
