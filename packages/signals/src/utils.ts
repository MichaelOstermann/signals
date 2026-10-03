import type { MaybeDispose } from "./disposer"
import type { Memo } from "./memo"
import type { ReadonlySignal, Signal } from "./signal"
import { disposer } from "./disposer"
import { cleanupCtx } from "./internals/contexts"
import { read } from "./internals/read"
import { pauseTracking, resumeTracking } from "./system"

export type Reactive<T> =
    | Memo<T>
    | Signal<T>
    | ReadonlySignal<T>

export type MaybeReactive<T> =
    | Reactive<T>
    | T

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
 * function peek<T>(target: MaybeReactive<T>): T;
 * ```
 *
 * Reads from a signal, memo, reducer, function or plain value without causing subscriptions.
 *
 * ## Example
 *
 * ```ts
 * import { peek, signal, memo } from "@monstermann/signals";
 *
 * const count = signal(0);
 *
 * peek(count); // 0
 * peek(memo(() => count() * 2)); // 0
 * peek(() => count() + 1); // 1
 * peek(1); // 1
 * ```
 */
export function peek<T>(target: MaybeReactive<T>): T {
    pauseTracking()

    try { return read(target) }
    finally { resumeTracking() }
}
