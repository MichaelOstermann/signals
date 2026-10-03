import type { Disposer, MaybeDispose } from "./disposer"
import type { Memo } from "./memo"
import type { Meta } from "./meta"
import type { ReadonlySignal } from "./signal"
import { disposer, isDisposed } from "./disposer"
import { cleanupCtx, watcherCtx } from "./internals/contexts"
import { hmr } from "./internals/hmr"
import { memo } from "./memo"
import { pauseTracking, RawEffect, resumeTracking } from "./system"

export interface Watcher extends Disposer {}

export interface WatcherOptions<T> {
    equals?: (before: T, after: T) => boolean
}

/**
 * # hasWatcher
 *
 * ```ts
 * function hasWatcher(): boolean;
 * ```
 *
 * Whether a `Watcher` is currently running.
 *
 * ## Example
 *
 * ```ts
 * import { signal, watch, hasWatcher } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * watch(count, () => {
 *     hasWatcher(); // true
 * });
 * ```
 */
export const hasWatcher = (): boolean => watcherCtx() !== undefined
/**
 * # currentWatcher
 *
 * ```ts
 * function currentWatcher(): Watcher | undefined;
 * ```
 *
 * Returns the nearest running `Watcher`, if any.
 *
 * ## Example
 *
 * ```ts
 * import { signal, watch, currentWatcher } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * watch(count, () => {
 *     currentWatcher(); // Watcher
 * });
 * ```
 */
export const currentWatcher = (): Watcher | undefined => watcherCtx()
/**
 * # disposeWatcher
 *
 * ```ts
 * function disposeWatcher(): void;
 * ```
 *
 * Disposes the nearest running `Watcher`, if any.
 *
 * ## Example
 *
 * ```ts
 * import { signal, watch, disposeWatcher } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * // Runs once:
 * watch(count, () => {
 *     disposeWatcher();
 * });
 * ```
 */
export const disposeWatcher = (): void => watcherCtx()?.()

/**
 * # watch
 *
 * ```ts
 * function watch<T>(
 *     dependencies: ReadonlySignal<T> | Memo<T> | (() => T),
 *     computation: (next: T, prev: T) => MaybeDispose,
 *     options?: WatcherOptions<T>,
 * ): Watcher;
 * ```
 *
 * Watchers allow you to react to changes made to signals, or derived state.
 *
 * Other than `effect`, the computation does not run initially, is batched and untracked, and receives the next and previous value.
 *
 * ## Example
 *
 * ```ts
 * import { signal, watch, onCleanup, onDispose, dispose } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * const w = watch(
 *     () => count(),
 *     (after, before) => {
 *         console.log(before, after);
 *
 *         // Do something before this runs next time, or gets disposed:
 *         onCleanup(() => {});
 *         return () => {};
 *     },
 * );
 *
 * // Prints: 0, 1
 * count(1);
 *
 * // Do something before disposal:
 * w(() => {});
 * onDispose(w, () => {});
 *
 * // Dispose:
 * w();
 * dispose(w);
 * ```
 *
 * ## Options
 *
 * ```ts
 * watch(dependencies, computation, {
 *     // Provide a custom comparator (runs after a basic === check):
 *     // Only used when passing a function as the first parameter.
 *     equals(before, after) {
 *         return true;
 *     },
 * });
 * ```
 */
export function watch<T>(
    dependencies: ReadonlySignal<T> | Memo<T> | (() => T),
    computation: (next: NoInfer<T>, prev: NoInfer<T>) => MaybeDispose,
    options?: WatcherOptions<NoInfer<T>>,
    meta?: Meta,
): Watcher {
    const watcher: Watcher = disposer()

    let init = false
    let current: T
    let cleanups: Disposer | undefined

    const deps = "kind" in dependencies
        ? dependencies
        : memo(dependencies, options)

    const rawEffect = new RawEffect(() => {
        const prev = current
        const prevWatcher = watcherCtx(watcher)
        const prevCleanups = cleanupCtx(undefined)
        try {
            current = deps()
            if (!init || isDisposed(watcher)) return void (init = true)
            pauseTracking()
            try {
                cleanups?.()
                const nextCleanups = cleanups = disposer()
                cleanupCtx(nextCleanups)
                if (isDisposed(watcher)) return
                nextCleanups(computation(current, prev))
                watcher(nextCleanups)
            }
            finally {
                resumeTracking()
            }
        }
        finally {
            cleanupCtx(prevCleanups)
            watcherCtx(prevWatcher)
        }
    })

    rawEffect.run()
    watcher(rawEffect.dispose.bind(rawEffect))
    hmr(watcher, meta)

    return watcher
}
