import type { Disposer } from "../disposer"
import type { Effect } from "../effect"
import type { Watcher } from "../watch"
import { context } from "../context"

/** Holds the cleanups of the current run, the disposer is only created when there are any. */
export interface Cleanups {
    current: Disposer | undefined
}

export const cleanupCtx = context<Cleanups>()

export function runCleanups(cleanups: Cleanups): void {
    const current = cleanups.current
    if (current === undefined) return
    cleanups.current = undefined
    current()
}
export const effectCtx = context<Effect>()
export const watcherCtx = context<Watcher>()
