import type { Disposer, MaybeDispose } from "./disposer"
import type { Meta } from "./meta"
import { disposer, isDisposed } from "./disposer"
import { cleanupCtx, effectCtx } from "./internals/contexts"
import { hmr } from "./internals/hmr"
import { RawEffect } from "./system"

export interface Effect extends Disposer {}

export const hasEffect = (): boolean => effectCtx() !== undefined
export const currentEffect = (): Effect | undefined => effectCtx()
export const disposeEffect = (): void => effectCtx()?.()

export function effect(
    computation: () => MaybeDispose,
    meta?: Meta,
): Effect {
    let cleanups: Disposer | undefined
    const effect: Effect = disposer()

    const rawEffect = new RawEffect(() => {
        const prevEffect = effectCtx(effect)
        const prevCleanups = cleanupCtx()
        try {
            cleanups?.()
            const nextCleanups = cleanups = disposer()
            cleanupCtx(nextCleanups)
            if (isDisposed(effect)) return
            nextCleanups(computation())
            effect(nextCleanups)
        }
        finally {
            cleanupCtx(prevCleanups)
            effectCtx(prevEffect)
        }
    })

    rawEffect.run()
    effect(rawEffect.dispose.bind(rawEffect))
    hmr(effect, meta)

    return effect
}

export function deferEffect<T = void>(fn: (
    resolve: (value: T) => void,
    reject: (reason?: any) => void,
) => MaybeDispose, meta?: Meta): Promise<T> {
    let dispose: Effect
    return new Promise<T>((resolve, reject) => {
        dispose = effect(() => fn(resolve, reject), meta)
        dispose(reject)
    }).finally(() => dispose())
}
