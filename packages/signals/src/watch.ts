import type { Disposer, MaybeDispose } from "./disposer"
import type { Memo } from "./memo"
import type { Meta, MetaOptions, UnpluginMeta } from "./meta"
import type { ReadonlySignal } from "./signal"
import { disposer, isDisposed } from "./disposer"
import { cleanupCtx, watcherCtx } from "./internals/contexts"
import { hmr } from "./internals/hmr"
import { emit } from "./internals/hooks"
import { isKind } from "./internals/isKind"
import { createMeta } from "./internals/meta"
import { defer, deferBatch, deferCleanups, deferContext, deferUntrack, run } from "./internals/runner"
import { memo } from "./memo"
import { WATCHER } from "./symbols"
import { RawEffect } from "./system"

export interface Watcher extends Disposer {
    kind: WATCHER
    meta: Meta
}

export interface WatcherOptions<T> extends MetaOptions {
    equals?: (before: T, after: T) => boolean
}

export const isWatcher = isKind<Watcher>(WATCHER)
export const hasWatcher = () => watcherCtx() !== undefined
export const currentWatcher = () => watcherCtx()
export const disposeWatcher = () => watcherCtx()?.()

export function watch<T>(
    dependencies: ReadonlySignal<T> | Memo<T> | (() => T),
    computation: (next: NoInfer<T>, prev: NoInfer<T>) => MaybeDispose,
    options?: WatcherOptions<T>,
    _meta?: UnpluginMeta,
): Watcher {
    const watcher = disposer() as Watcher
    const meta = createMeta("Watcher", options, _meta)
    watcher.kind = WATCHER
    watcher.meta = meta

    let init = false
    let current: T
    let cleanups: Disposer | undefined

    const deps = "meta" in dependencies
        ? dependencies
        : memo(dependencies, { equals: options?.equals, internal: true })

    const rawEffect = new RawEffect(() => run(() => {
        const prev = current
        if (!meta.silent) {
            emit({ name: "WATCHER_START", value: prev, watcher })
            defer(() => emit({ name: "WATCHER_END", value: current, watcher }))
        }
        deferContext(watcherCtx, watcher)
        deferContext(cleanupCtx, undefined)
        current = deps()
        if (!init || isDisposed(watcher)) return void (init = true)
        deferBatch()
        deferUntrack()
        cleanups = deferCleanups(cleanups)
        if (isDisposed(watcher)) return
        cleanups(computation(current, prev))
        watcher(cleanups)
    }))

    rawEffect.run()
    watcher(rawEffect.dispose.bind(rawEffect))
    hmr(watcher)

    return watcher
}
