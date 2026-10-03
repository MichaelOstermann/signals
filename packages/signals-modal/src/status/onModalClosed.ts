import { emitter } from "@monstermann/signals"

/**
 * # onModalClosed
 *
 * ```ts
 * const onModalClosed: Emitter<string>;
 * ```
 *
 * An emitter that fires when a modal transitions to the `"closed"` status. The emitted value is the modal key.
 *
 * ## Example
 *
 * ```ts
 * import {
 *     createModal,
 *     withModalStatus,
 *     onModalClosed,
 * } from "@monstermann/signals-modal";
 *
 * createModal("key", () => {
 *     withModalStatus();
 * });
 *
 * const stopListening = onModalClosed((key) => {
 *     console.log(`Modal ${key} closed`);
 * });
 *
 * stopListening();
 * ```
 *
 */
export const onModalClosed = emitter<string>()
