import type { Disposer, MaybeDispose } from "./disposer"
import type { Meta, MetaOptions, UnpluginMeta } from "./meta"
import { disposer, isDisposed } from "./disposer"
import { effectCtx } from "./internals/contexts"
import { hmr } from "./internals/hmr"
import { emit } from "./internals/hooks"
import { isKind } from "./internals/isKind"
import { createMeta } from "./internals/meta"
import { defer, deferCleanups, deferContext, run } from "./internals/runner"
import { EFFECT } from "./symbols"
import { RawEffect } from "./system"

export interface Effect extends Disposer {
    kind: EFFECT
    meta: Meta
}

export interface EffectOptions extends MetaOptions {}

export const isEffect = isKind<Effect>(EFFECT)
export const hasEffect = () => effectCtx() !== undefined
export const currentEffect = () => effectCtx()
export const disposeEffect = () => effectCtx()?.()

export function effect(
    computation: () => MaybeDispose,
    options?: EffectOptions,
    _meta?: UnpluginMeta,
): Effect {
    let cleanups: Disposer | undefined
    const effect = disposer() as Effect
    const meta = createMeta("Effect", options, _meta)
    effect.kind = EFFECT
    effect.meta = meta

    const rawEffect = new RawEffect(() => run(() => {
        if (!meta.silent) {
            emit({ effect, name: "EFFECT_START" })
            defer(() => emit({ effect, name: "EFFECT_END" }))
        }
        deferContext(effectCtx, effect)
        cleanups = deferCleanups(cleanups)
        if (isDisposed(effect)) return
        cleanups(computation())
        effect(cleanups)
    }))

    rawEffect.run()
    effect(rawEffect.dispose.bind(rawEffect))
    hmr(effect)

    return effect
}

export function deferEffect<T = void>(fn: (
    resolve: (value: T) => void,
    reject: (reason?: any) => void,
) => MaybeDispose, options?: EffectOptions, _meta?: UnpluginMeta): Promise<T> {
    let dispose: Effect
    return new Promise<T>((resolve, reject) => {
        dispose = effect(() => fn(resolve, reject), options, _meta)
        dispose(reject)
    }).finally(() => dispose())
}
