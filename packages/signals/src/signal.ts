import type { Dispose } from "./disposer"
import type { Meta, MetaOptions, UnpluginMeta } from "./meta"
import { emit } from "./internals/hooks"
import { isKind } from "./internals/isKind"
import { createMeta } from "./internals/meta"
import { register, registry, toList } from "./internals/registry"
import { SIGNAL } from "./symbols"
import { RawSignal } from "./system"

export interface Signal<T = any> {
    (transform: (value: T) => T): void
    (value: T): void
    (): T
    kind: SIGNAL
    meta: Meta
}

export interface ReadonlySignal<T = any> {
    (): T
    kind: SIGNAL
    meta: Meta
}

export interface SignalOptions<T> extends MetaOptions {
    equals?: (before: T, after: T) => boolean
    onRead?: () => void
    onWatch?: () => Dispose | void
}

const signals = registry<Signal>()
export const isSignal = isKind<Signal>(SIGNAL)
export const getSignals = toList(signals)

export function signal<T>(
    value: T,
    options?: SignalOptions<NoInfer<T>>,
    _meta?: UnpluginMeta,
): Signal<T>

export function signal<T>(
    value: T | null,
    options?: SignalOptions<NoInfer<T> | null>,
    _meta?: UnpluginMeta,
): Signal<T | null>

export function signal<T>(
    value: T | undefined | void,
    options?: SignalOptions<NoInfer<T> | undefined>,
    _meta?: UnpluginMeta,
): Signal<T | undefined>

export function signal<T>(
    value: T,
    options?: SignalOptions<NoInfer<T>>,
    _meta?: UnpluginMeta,
): Signal<T> {
    const s = new RawSignal(value, options)
    const meta = createMeta("Signal", options, _meta)
    let prev = value

    const signal = function (...args: [T] | []): T | void {
        if (args.length === 0) return s.get()
        const next = typeof args[0] === "function" ? args[0](prev) : args[0]
        if (prev === next || options?.equals?.(prev, next)) return
        if (!meta.silent) emit({ name: "SIGNAL_WRITE", next, prev, signal })
        s.set(prev = next)
    } as Signal<T>

    signal.kind = SIGNAL
    signal.meta = meta
    register(signals, signal)

    return signal
}
