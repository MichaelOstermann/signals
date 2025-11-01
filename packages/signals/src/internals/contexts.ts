import type { Dsp } from "@monstermann/dsp"
import type { Disposer } from "../disposer"
import type { Effect } from "../effect"
import type { Watcher } from "../watch"
import { context } from "../context"

export const cleanupCtx = context<Disposer>()
export const runnerCtx = context<Dsp>()
export const effectCtx = context<Effect>()
export const watcherCtx = context<Watcher>()
