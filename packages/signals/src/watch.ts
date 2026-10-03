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

export const hasWatcher = (): boolean => watcherCtx() !== undefined
export const currentWatcher = (): Watcher | undefined => watcherCtx()
export const disposeWatcher = (): void => watcherCtx()?.()

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
