import { Dsp } from "@monstermann/fn"
import { DISPOSER } from "./symbols"
import { endBatch, pauseTracking, resumeTracking, startBatch } from "./system"

export interface Dispose {
    (): void
}

export interface Disposer extends DisposerMixin {
    (): void
    (onDispose: MaybeDispose): void
}

export interface DisposerMixin {
    [DISPOSER]: Dsp
}

export type MaybeDispose =
    | Dispose
    | DisposerMixin
    | void

/**
 * # disposer
 *
 * ```ts
 * function disposer(...cleanups: MaybeDispose[]): Disposer;
 * ```
 *
 * Creates a new `Disposer` instance, which collects callbacks and other `Disposer` instances and invokes them in reverse order when disposed, cleaning up any references as necessary.
 *
 * The process of disposing is batched and untracked.
 *
 * ## Example
 *
 * ```ts
 * import { disposer } from "@monstermann/signals";
 *
 * const a = disposer();
 * const b = disposer();
 *
 * // Register callbacks:
 * a(() => console.log(1));
 * b(() => console.log(2));
 *
 * // Register other disposers:
 * a(b);
 *
 * // Dispose - prints: 2, 1
 * a();
 *
 * // No effect - already disposed.
 * a();
 * b();
 * ```
 */
export function disposer(...cleanups: MaybeDispose[]): Disposer {
    const disposer = mixinDisposer((...args: [] | [onDispose?: MaybeDispose]) =>
        args.length ? onDispose(disposer, args[0]) : dispose(disposer))
    cleanups.forEach(cleanup => onDispose(disposer, cleanup))
    return disposer
}

/**
 * # mixinDisposer
 *
 * ```ts
 * function mixinDisposer<T extends object>(target: T): T & DisposerMixin;
 * ```
 *
 * Takes an object and extends it with `Disposer` properties.
 *
 * ## Example
 *
 * ```ts
 * import { mixinDisposer, onDispose, dispose } from "@monstermann/signals";
 *
 * const example = mixinDisposer(() => console.log("Hello world!"));
 *
 * // Prints: "Hello world!"
 * example();
 *
 * // Use disposer utils:
 * onDispose(example, () => {});
 * dispose(example);
 * ```
 */
export function mixinDisposer<T extends object>(target: T): T & DisposerMixin {
    (target as T & DisposerMixin)[DISPOSER] = Dsp.create()
    return target as T & DisposerMixin
}

/**
 * # isDisposed
 *
 * ```ts
 * function isDisposed(target: DisposerMixin): boolean;
 * ```
 *
 * Whether the target has been disposed.
 *
 * ## Example
 *
 * ```ts
 * import { disposer, isDisposed } from "@monstermann/signals";
 *
 * const a = disposer();
 *
 * isDisposed(a); // false
 * a();
 * isDisposed(a); // true
 * ```
 */
export function isDisposed(target: DisposerMixin): boolean {
    return Dsp.isDisposed(target[DISPOSER])
}

/**
 * # onDispose
 *
 * ```ts
 * function onDispose<T extends MaybeDispose>(target: DisposerMixin, onDispose: T): T;
 * ```
 *
 * Attaches a callback or another `Disposer` that is invoked when the target gets disposed.
 *
 * If called on an already disposed `Disposer`, immediately disposes the given value.
 *
 * ## Example
 *
 * ```ts
 * import { disposer, onDispose, dispose } from "@monstermann/signals";
 *
 * const a = disposer();
 * const b = disposer();
 *
 * onDispose(a, () => console.log(1));
 * onDispose(b, () => console.log(2));
 * onDispose(a, b);
 *
 * // Prints: 2, 1
 * dispose(a);
 *
 * // No effect - already disposed.
 * dispose(a);
 * dispose(b);
 * ```
 */
export function onDispose<T extends MaybeDispose>(target: DisposerMixin, onDispose: T): T {
    onDispose && Dsp.add(target[DISPOSER], DISPOSER in onDispose ? onDispose[DISPOSER] : onDispose)
    return onDispose
}

/**
 * # dispose
 *
 * ```ts
 * function dispose(target: DisposerMixin): void;
 * ```
 *
 * Disposes the target, batched and untracked.
 *
 * ## Example
 *
 * ```ts
 * import { effect, dispose } from "@monstermann/signals";
 *
 * const e = effect(() => {});
 *
 * dispose(e);
 * ```
 */
export function dispose(target: DisposerMixin): void {
    startBatch()
    pauseTracking()
    try {
        Dsp.dispose(target[DISPOSER])
    }
    finally {
        resumeTracking()
        endBatch()
    }
}

/**
 * # disposed
 *
 * ```ts
 * const disposed: DisposerMixin;
 * ```
 *
 * A reference to a static `Disposer` instance that has been disposed.
 *
 * ## Example
 *
 * ```ts
 * import { disposer, disposed } from "@monstermann/signals";
 *
 * function example() {
 *     if (condition) {
 *         return disposed;
 *     } else {
 *         return disposer();
 *     }
 * }
 * ```
 */
export const disposed = mixinDisposer(() => {})
dispose(disposed)
