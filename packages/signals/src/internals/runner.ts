import type { Context } from "../context"
import type { Disposer } from "../disposer"
import { Dsp } from "@monstermann/dsp"
import { disposer } from "../disposer"
import { endBatch, pauseTracking, resumeTracking, startBatch } from "../system"
import { cleanupCtx, runnerCtx } from "./contexts"
import { emit } from "./hooks"

export function run<T>(fn: () => T): T {
    const dsp = Dsp.create()
    const prev = runnerCtx(dsp)
    try {
        return fn()
    }
    catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        emit({ error, name: "ERROR" })
        throw error
    }
    finally {
        runnerCtx(prev)
        Dsp.dispose(dsp)
    }
}

export function defer(fn: () => void): void {
    const dsp = runnerCtx()
    dsp && Dsp.add(dsp, fn)
}

export function deferBatch(): void {
    startBatch()
    defer(endBatch)
}

export function deferUntrack(): void {
    pauseTracking()
    defer(resumeTracking)
}

export function deferContext<T>(runnerCtx: Context<T>, value: NoInfer<T> | undefined): void {
    const prev = runnerCtx(value)
    defer(() => runnerCtx(prev))
}

export function deferCleanups(cleanups: Disposer | undefined): Disposer {
    cleanups?.()
    const next = disposer()
    const prev = cleanupCtx(next)
    defer(() => cleanupCtx(prev))
    return next
}
