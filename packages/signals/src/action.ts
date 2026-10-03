import type { Cleanups } from "./internals/contexts"
import { cleanupCtx, runCleanups } from "./internals/contexts"
import { endBatch, pauseTracking, resumeTracking, startBatch } from "./system"

export interface Action<T extends unknown[] = any[], U = any> {
    (...args: T): U
}

/**
 * # action
 *
 * ```ts
 * function action<T extends unknown[], U>(handler: (...args: T) => U): Action<T, U>;
 * ```
 *
 * Actions are plain functions that are untracked and batched that you can use to eg. update a collection of signals.
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
 * ```
 */
export function action<T extends unknown[] = never, U = void>(handler: (...args: T) => U): Action<T, U> {
    const cleanups: Cleanups = { current: undefined }

    return (...args) => {
        runCleanups(cleanups)
        const prevCleanups = cleanupCtx(cleanups)
        startBatch()
        pauseTracking()
        try {
            return handler(...args)
        }
        finally {
            cleanupCtx(prevCleanups)
            resumeTracking()
            endBatch()
        }
    }
}
