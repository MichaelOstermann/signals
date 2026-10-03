import type { Dispose, Disposer } from "./disposer"
import type { Meta } from "./meta"
import { disposer } from "./disposer"
import { cleanupCtx } from "./internals/contexts"
import { endBatch, pauseTracking, resumeTracking, startBatch } from "./system"

export interface Action<T extends unknown[] = any[], U = any> {
    (...args: T): U
    meta: ActionMeta
}

export interface ActionMeta {
    readonly line: number
    readonly name: string
    readonly path: string
}

export interface ActionListener {
    (action: Action, args: unknown[]): void
}

const anonymous: ActionMeta = { line: 0, name: "", path: "" }
let listener: ActionListener | undefined

export function onAction(onAction: ActionListener): Dispose {
    listener = onAction
    return () => {
        if (listener === onAction) listener = undefined
    }
}

export function action<T extends unknown[] = never, U = void>(
    handler: (...args: T) => U,
    meta?: Partial<Meta>,
): Action<T, U> {
    let cleanups: Disposer | undefined

    const action: Action<T, U> = (...args: any) => {
        listener?.(action as Action, args)
        cleanups?.()
        const prevCleanups = cleanupCtx(cleanups = disposer())
        startBatch()
        pauseTracking()
        try {
            return handler(...args as T)
        }
        finally {
            cleanupCtx(prevCleanups)
            resumeTracking()
            endBatch()
        }
    }

    action.meta = meta
        ? { line: meta.line ?? 0, name: meta.name ?? "", path: meta.path ?? "" }
        : anonymous

    return action
}
