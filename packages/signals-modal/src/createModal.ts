import type { MaybeDispose } from "@monstermann/signals"
import { context, disposer, emitter, isDisposed, untrack } from "@monstermann/signals"
import { modalsToStatus } from "./status/internals"
import { onModalClosed } from "./status/onModalClosed"

export interface ModalContext {
    key: string
    dispose: () => void
    isDisposed: () => boolean
    onDispose: (dispose: MaybeDispose) => void
}

const modalCtx = context<ModalContext>()

/**
 * # onModalCreated
 *
 * ```ts
 * const onModalCreated: Emitter<string>;
 * ```
 *
 * An emitter that fires when a modal has been created. The emitted value is the modal key.
 *
 * Which modals exist is not reactive, this and `onModalDisposed` are how to keep track of them.
 *
 * ## Example
 *
 * ```ts
 * import { createModal, onModalCreated } from "@monstermann/signals-modal";
 *
 * const stopListening = onModalCreated((key) => {
 *     console.log(`Modal ${key} created`);
 * });
 *
 * createModal("key", () => ({}));
 *
 * stopListening();
 * ```
 */
export const onModalCreated = emitter<string>()

export const onModalDisposed = emitter<string>()

export function currentModal(): ModalContext {
    const ctx = modalCtx()
    if (!ctx) throw new Error("`currentModal` called outside of `createModal` context.")
    return ctx
}

/**
 * # createModal
 *
 * ```ts
 * function createModal(
 *     key: string,
 *     setup: () => T,
 * ): T & {
 *     key: string;
 *     dispose: () => void;
 *     isDisposed: () => boolean;
 *     onDispose: (dispose: MaybeDispose) => void;
 * };
 * ```
 *
 * Creates a new modal.
 *
 * ## Example
 *
 * ```ts
 * import { createModal } from "@monstermann/signals-modal";
 *
 * const modal = createModal("key", () => ({}));
 * modal.key;
 * modal.dispose();
 * modal.onDispose(callback);
 * ```
 *
 */
export function createModal<T extends object>(
    key: string,
    setup: () => T,
): ModalContext & T {
    const dispose = disposer()
    let stopWaiting: (() => void) | undefined
    const nextCtx: ModalContext = {
        key,
        onDispose: dispose,
        isDisposed: () => isDisposed(dispose),
        dispose() {
            if (isDisposed(dispose)) return

            // The status of this modal, not of whichever modal currently has this key.
            const $status = modalsToStatus.get(nextCtx)
            const status = $status ? untrack($status) : "closed"

            if (status === "closed") {
                stopWaiting?.()
                dispose()
                onModalDisposed(key)
                return
            }

            // Wait for the modal to be closed, only once and only for this modal.
            stopWaiting ??= onModalClosed((k) => {
                if (k === key) nextCtx.dispose()
            })
            if (status !== "closing") $status!("closing")
        },
    }
    const prevCtx = modalCtx(nextCtx)
    let modal: ModalContext & T

    try {
        modal = { ...nextCtx, ...setup() }
    }
    finally {
        modalCtx(prevCtx)
    }

    onModalCreated(key)
    return modal
}
