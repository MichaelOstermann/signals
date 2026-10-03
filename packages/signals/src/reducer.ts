import type { Dispose } from "./disposer"
import { REDUCER } from "./symbols"
import { RawSignal } from "./system"

export interface Reducer<T = any, U extends ReducerAction = ReducerAction> {
    (action: U): void
    (): T
    kind: REDUCER
}

export interface ReadonlyReducer<T = any> {
    (): T
    kind: REDUCER
}

export interface ReducerAction<T extends string = string> {
    [x: string]: unknown
    type: T
}

export interface ReducerOptions<T> {
    equals?: (before: T, after: T) => boolean
    onRead?: () => void
    onWatch?: () => Dispose | void
}

export function reducer<T, U extends ReducerAction>(
    initialState: T,
    reduce: (state: T, action: U) => T,
    options?: ReducerOptions<NoInfer<T>>,
): Reducer<T, U> {
    const s = new RawSignal(initialState, options)
    let prev = initialState

    const reducer = function (...args: [U] | []): T | void {
        if (args.length === 0) return s.get()
        const next = reduce(prev, args[0])
        if (prev === next || options?.equals?.(prev, next)) return
        s.set(prev = next)
    } as Reducer<T, U>

    reducer.kind = REDUCER

    return reducer
}
