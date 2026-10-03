import type { Dispose } from "./disposer"
import type { Cleanups } from "./internals/contexts"
import type { Meta } from "./meta"
import { cleanupCtx, runCleanups } from "./internals/contexts"
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

/**
 * # onAction
 *
 * ```ts
 * function onAction(listener: (action: Action, args: unknown[]) => void): Dispose;
 * ```
 *
 * Calls the listener right before an action runs, eg. to keep a log of what happened for bug reports.
 *
 * There is a single listener, registering another one replaces it.
 *
 * ## Example
 *
 * ```ts
 * import { action, onAction } from "@monstermann/signals";
 *
 * const save = action((id: number) => {});
 *
 * const stop = onAction((action, args) => {
 *     const { name, path, line } = action.meta;
 *     console.log(`${name}(${path}:${line})`, args);
 * });
 *
 * // Prints: save(src/save.ts:3) [1]
 * save(1);
 *
 * stop();
 * ```
 */
export function onAction(onAction: ActionListener): Dispose {
    listener = onAction
    return () => {
        if (listener === onAction) listener = undefined
    }
}

/**
 * # action
 *
 * ```ts
 * function action<T extends unknown[], U>(
 *     handler: (...args: T) => U,
 *     meta?: { name?: string },
 * ): Action<T, U>;
 * ```
 *
 * Actions are plain functions that are untracked and batched that you can use to eg. update a collection of signals.
 *
 * `@monstermann/signals-transform` gives them the name, path and line of where they have been created as `action.meta`, see `onAction` for getting notified about the ones that ran.
 *
 * ## Example
 *
 * ```ts
 * import { action, signal, onCleanup } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * // Create:
 * const updateCount = action(
 *     (type: "inc" | "dec", amount: number = 1): number => {
 *         switch (type) {
 *             case "inc":
 *                 count((n) => n + amount);
 *                 break;
 *             case "dec":
 *                 count((n) => n - amount);
 *                 break;
 *         }
 *         // Do something before this runs next time:
 *         onCleanup(() => {});
 *         return count();
 *     },
 * );
 *
 * // Run (batched + untracked):
 * const result = updateCount("inc", 5);
 *
 * // Named by hand, instead of by the transform:
 * const reset = action(() => count(0), { name: "reset" });
 * ```
 */
export function action<T extends unknown[] = never, U = void>(
    handler: (...args: T) => U,
    meta?: Partial<Meta>,
): Action<T, U> {
    const cleanups: Cleanups = { current: undefined }

    const action: Action<T, U> = (...args: any) => {
        listener?.(action as Action, args)
        runCleanups(cleanups)
        const prevCleanups = cleanupCtx(cleanups)
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
