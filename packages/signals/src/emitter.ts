import type { Dispose, DisposerMixin } from "./disposer"
import type { Meta } from "./meta"
import { disposed, isDisposed, mixinDisposer, onDispose } from "./disposer"
import { hmr } from "./internals/hmr"
import { endBatch, pauseTracking, resumeTracking, startBatch } from "./system"

export interface EmitterCallback<T = any> {
    (message: T): void
}

export interface ReadonlyEmitter<T = any> extends DisposerMixin {
    (onMessage: EmitterCallback<T>): Dispose
    listeners: Set<EmitterCallback<T>>
}

export interface Emitter<T = any> extends ReadonlyEmitter<T> {
    (message: T): void
}

/**
 * # emitter
 *
 * ```ts
 * function emitter<T = void>(): Emitter<T>;
 * ```
 *
 * Emitters are simple `EventEmitter`s that ship a single event. Emitting events is untracked and batched.
 *
 * Listeners are kept in a `Set`: The same function counts once, and listeners added while emitting are called as well.
 *
 * ## Example
 *
 * ```ts
 * import { emitter, onDispose, dispose } from "@monstermann/signals";
 *
 * const onMsg = emitter<string>();
 *
 * // Subscribe:
 * const unsubscribe = onMsg((msg) => console.log(msg));
 *
 * // Emit (batched + untracked):
 * onMsg("Hello world!");
 *
 * // Unsubscribe:
 * unsubscribe();
 *
 * // Do something before disposal:
 * onDispose(onMsg, () => {});
 *
 * // Dispose, removes all listeners:
 * dispose(onMsg);
 * ```
 *
 * ## Splitting Events
 *
 * While emitters only emit single events, you can quickly emulate an `EventEmitter`:
 *
 * ```ts
 * const onStatus = emitter<"open" | "close">();
 * const onOpen = (callback) => onStatus((msg) => msg === "open" && callback());
 * const onClose = (callback) => onStatus((msg) => msg === "close" && callback());
 *
 * onStatus((status) => console.log(status));
 * onOpen(() => console.log("opened"));
 * onClose(() => console.log("closed"));
 * ```
 */
export function emitter<T = void>(meta?: Meta): Emitter<T> {
    const listeners = new Set<EmitterCallback<T>>()

    const emitter = mixinDisposer((a: any) =>
        typeof a === "function"
            ? on(emitter, a)
            : send(emitter, a),
    ) as Emitter<T>

    emitter.listeners = listeners
    onDispose(emitter, () => listeners.clear())
    hmr(emitter, meta)

    return emitter
}

function on<T>(emitter: Emitter<T>, onMessage: EmitterCallback<T>): Dispose {
    if (isDisposed(emitter)) return disposed
    const listeners = emitter.listeners
    listeners.add(onMessage)
    return () => void listeners.delete(onMessage)
}

function send<T>(emitter: Emitter<T>, message: T): void {
    const listeners = emitter.listeners
    if (!listeners.size) return
    startBatch()
    pauseTracking()
    try {
        for (const listener of listeners) listener(message)
    }
    finally {
        resumeTracking()
        endBatch()
    }
}
