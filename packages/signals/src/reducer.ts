import type { Dispose } from "./disposer"
import type { Meta, MetaOptions, UnpluginMeta } from "./meta"
import { emit } from "./internals/hooks"
import { isKind } from "./internals/isKind"
import { createMeta } from "./internals/meta"
import { register, registry, toList } from "./internals/registry"
import { REDUCER } from "./symbols"
import { RawSignal } from "./system"

export interface Reducer<T = any, U extends ReducerAction = ReducerAction> {
    (action: U): void
    (): T
    kind: REDUCER
    meta: Meta
}

export interface ReadonlyReducer<T = any> {
    (): T
    kind: REDUCER
    meta: Meta
}

export interface ReducerAction<T extends string = string> {
    [x: string]: unknown
    type: T
}

export interface ReducerOptions<T> extends MetaOptions {
    equals?: (before: T, after: T) => boolean
    onRead?: () => void
    onWatch?: () => Dispose | void
}

const reducers = registry<Reducer>()
export const isReducer = isKind<Reducer>(REDUCER)
export const getReducers = toList(reducers)

export function reducer<T, U extends ReducerAction>(
    initialState: T,
    reduce: (state: T, action: U) => T,
    options?: ReducerOptions<NoInfer<T>>,
    _meta?: UnpluginMeta,
): Reducer<T, U> {
    const s = new RawSignal(initialState, options)
    const meta = createMeta("Reducer", options, _meta)
    let prev = initialState

    const reducer = function (...args: [U] | []): T | void {
        if (args.length === 0) return s.get()
        const next = reduce(prev, args[0])
        if (prev === next || options?.equals?.(prev, next)) return
        if (!meta.silent) emit({ action: args[0], name: "REDUCER_WRITE", next, prev, reducer })
        s.set(prev = next)
    } as Reducer<T>

    reducer.kind = REDUCER
    reducer.meta = meta
    register(reducers, reducer)

    return reducer
}
