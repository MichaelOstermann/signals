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
    mutable?: boolean
    equals?: (before: T, after: T) => boolean
    onRead?: () => void
    onWatch?: () => Dispose | void
}

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
        if ((!options?.mutable && prev === next) || options?.equals?.(prev, next)) return
        s.set(prev = next)
    } as Signal<T>

    signal.kind = SIGNAL

    return signal
}
