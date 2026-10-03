import type { MaybeDispose } from "./disposer"
import { disposer } from "./disposer"
import { cleanupCtx } from "./internals/contexts"
import { untrack } from "./system"

/**
 * # onCleanup
 *
 * ```ts
 * function onCleanup<T extends MaybeDispose>(onDispose: T): T;
 * ```
 *
 * Allows you to register callbacks that are invoked when `Action`s, `Effect`s or `Watcher`s rerun or get disposed.
 *
 * ## Example
 *
 * ```ts
 * import { effect, onCleanup } from "@monstermann/signals";
 *
 * effect(() => {
 *     // Do something before this runs next time, or gets disposed:
 *     onCleanup(() => {});
 * });
 * ```
 */
export function onCleanup<T extends MaybeDispose>(onDispose: T): T {
    const cleanups = cleanupCtx()
    if (cleanups) (cleanups.current ??= disposer())(onDispose)
    return onDispose
}

/**
 * # peek
 *
 * ```ts
 * function peek<T>(target: () => T): T;
 * ```
 *
 * Reads from a signal, memo, reducer or function without causing subscriptions. Same as `untrack`.
 *
 * ## Example
 *
 * ```ts
 * import { effect, peek, signal } from "@monstermann/signals";
 *
 * const a = signal(0);
 * const b = signal(0);
 *
 * // Only reruns when `a` changes:
 * effect(() => console.log(a(), peek(b)));
 * ```
 */
export const peek: <T>(target: () => T) => T = untrack
