import type { Disposer, MaybeDispose } from "./disposer"
import type { Cleanups } from "./internals/contexts"
import type { Meta } from "./meta"
import { disposer, isDisposed } from "./disposer"
import { cleanupCtx, effectCtx, runCleanups } from "./internals/contexts"
import { hmr } from "./internals/hmr"
import { RawEffect } from "./system"

export interface Effect extends Disposer {}

/**
 * # hasEffect
 *
 * ```ts
 * function hasEffect(): boolean;
 * ```
 *
 * Whether an `Effect` is currently running.
 *
 * ## Example
 *
 * ```ts
 * import { effect, hasEffect } from "@monstermann/signals";
 *
 * hasEffect(); // false
 *
 * effect(() => {
 *     hasEffect(); // true
 * });
 * ```
 */
export const hasEffect = (): boolean => effectCtx() !== undefined
/**
 * # currentEffect
 *
 * ```ts
 * function currentEffect(): Effect | undefined;
 * ```
 *
 * Returns the nearest running `Effect`, if any.
 *
 * ## Example
 *
 * ```ts
 * import { effect, currentEffect } from "@monstermann/signals";
 *
 * effect(() => {
 *     currentEffect(); // Effect
 * });
 * ```
 */
export const currentEffect = (): Effect | undefined => effectCtx()
/**
 * # disposeEffect
 *
 * ```ts
 * function disposeEffect(): void;
 * ```
 *
 * Disposes the nearest running `Effect`, if any.
 *
 * ## Example
 *
 * ```ts
 * import { effect, disposeEffect } from "@monstermann/signals";
 *
 * effect(() => {
 *     disposeEffect();
 * });
 * ```
 */
export const disposeEffect = (): void => effectCtx()?.()

/**
 * # effect
 *
 * ```ts
 * function effect(computation: () => MaybeDispose): Effect;
 * ```
 *
 * Effects are functions that continuously rerun whenever the signals accessed within changed.
 *
 * ## Example
 *
 * ```ts
 * import { signal, effect, onCleanup, onDispose, dispose } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * // Create:
 * const e = effect(() => {
 *     console.log(count());
 *     // Do something before this runs next time, or gets disposed:
 *     onCleanup(() => {});
 *     return () => {};
 * });
 *
 * // Do something before disposal:
 * e(() => {});
 * onDispose(e, () => {});
 *
 * // Dispose:
 * e();
 * dispose(e);
 * ```
 */
export function effect(
    computation: () => MaybeDispose,
    meta?: Meta,
): Effect {
    const cleanups: Cleanups = { current: undefined }
    const effect: Effect = disposer()

    const rawEffect = new RawEffect(() => {
        const prevEffect = effectCtx(effect)
        const prevCleanups = cleanupCtx(cleanups)
        try {
            runCleanups(cleanups)
            if (isDisposed(effect)) return
            const cleanup = computation()
            if (cleanup) (cleanups.current ??= disposer())(cleanup)
            if (isDisposed(effect)) runCleanups(cleanups)
        }
        finally {
            cleanupCtx(prevCleanups)
            effectCtx(prevEffect)
        }
    })

    rawEffect.run()
    effect(() => rawEffect.dispose())
    effect(() => runCleanups(cleanups))
    hmr(effect, meta)

    return effect
}

/**
 * # deferEffect
 *
 * ```ts
 * function deferEffect<T>(
 *     fn: (
 *         resolve: (value: T) => void,
 *         reject: (reason?: any) => void,
 *     ) => MaybeDispose,
 * ): Promise<T>;
 * ```
 *
 * Creates a `Promise` that is resolved/rejected by using an `Effect`, which is disposed afterwards.
 *
 * ## Example
 *
 * ```ts
 * import { signal, deferEffect } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * const deferred = deferEffect<string>((resolve) => {
 *     if (count() === 0) return;
 *     resolve("Resolved!");
 * });
 *
 * // Resolves deferred:
 * count(1);
 *
 * await deferred; // "Resolved!"
 * ```
 */
export function deferEffect<T = void>(fn: (
    resolve: (value: T) => void,
    reject: (reason?: any) => void,
) => MaybeDispose): Promise<T> {
    let dispose: Effect
    return new Promise<T>((resolve, reject) => {
        dispose = effect(() => fn(resolve, reject))
        dispose(reject)
    }).finally(() => dispose())
}
