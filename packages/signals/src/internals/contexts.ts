import type { Disposer } from "../disposer"
import type { Effect } from "../effect"
import type { Watcher } from "../watch"
import { context } from "../context"

export const cleanupCtx = context<Disposer>()
export const effectCtx = context<Effect>()
export const watcherCtx = context<Watcher>()
