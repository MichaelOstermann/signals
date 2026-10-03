import type { MaybeDispose } from "@monstermann/signals"
import { context, disposer, emitter, isDisposed } from "@monstermann/signals"
import { closeModal } from "./status/closeModal"
import { isModalClosed } from "./status/isModalClosed"
import { onModalClosed } from "./status/onModalClosed"

export interface ModalContext {
    key: string
    dispose: () => void
    isDisposed: () => boolean
    onDispose: (dispose: MaybeDispose) => void
}

const modalCtx = context<ModalContext>()

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

            if (isModalClosed(key)) {
                stopWaiting?.()
                dispose()
                onModalDisposed(key)
                return
            }

            // Wait for the modal to be closed, only once and only for this modal.
            stopWaiting ??= onModalClosed((k) => {
                if (k === key) nextCtx.dispose()
            })
            closeModal(key)
        },
    }
    const prevCtx = modalCtx(nextCtx)

    try {
        const result = setup()
        return { ...nextCtx, ...result }
    }
    finally {
        modalCtx(prevCtx)
    }
}
