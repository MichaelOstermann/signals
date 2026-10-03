import type { Dispose } from "./disposer"
import { SIGNAL } from "./symbols"
import { RawSignal } from "./system"

export interface Signal<T = any> {
    (transform: (value: T) => T): void
    (value: T): void
    (): T
    kind: SIGNAL
}

export interface ReadonlySignal<T = any> {
    (): T
    kind: SIGNAL
}

export interface SignalOptions<T> {
    equals?: (before: T, after: T) => boolean
    onRead?: () => void
    onWatch?: () => Dispose | void
}

/**
 * # signal
 *
 * ```ts
 * function signal<T>(value: T, options?: SignalOptions<T>): Signal<T>;
 * ```
 *
 * Signals are a primitive that describe values that change over time.
 *
 * ## Example
 *
 * ```ts
 * import { signal } from "@monstermann/signals";
 *
 * // Create:
 * const count = signal(0);
 *
 * // Update:
 * count(1);
 *
 * // Transform:
 * count((n) => n + 1);
 *
 * // Read:
 * count(); // 2
 * ```
 *
 * ## Options
 *
 * ```ts
 * signal(value, {
 *     // Provide a custom comparator (runs after a basic === check):
 *     equals(before, after) {
 *         return true;
 *     },
 *     // Do something before this signal is being read from:
 *     onRead() {},
 *     // Do something when this signal is being watched (memo/effect):
 *     onWatch() {
 *         // Do something when this signal is no longer being watched:
 *         return () => {};
 *     },
 * });
 * ```
 */
export function signal<T>(
    value: T,
    options?: SignalOptions<NoInfer<T>>,
): Signal<T>

export function signal<T>(
    value: T | null,
    options?: SignalOptions<NoInfer<T> | null>,
): Signal<T | null>

export function signal<T>(
    value: T | undefined | void,
    options?: SignalOptions<NoInfer<T> | undefined>,
): Signal<T | undefined>

export function signal<T>(
    value: T,
    options?: SignalOptions<NoInfer<T>>,
): Signal<T> {
    const s = new RawSignal(value, options)
    let prev = value

    const signal = function (...args: [T] | []): T | void {
        if (args.length === 0) return s.get()
        const next = typeof args[0] === "function" ? args[0](prev) : args[0]
        if (prev === next || options?.equals?.(prev, next)) return
        s.set(prev = next)
    } as Signal<T>

    signal.kind = SIGNAL

    return signal
}
