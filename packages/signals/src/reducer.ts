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

/**
 * # reducer
 *
 * ```ts
 * function reducer<T, U>(
 *     initialState: T,
 *     reduce: (state: T, action: U) => T,
 *     options?: ReducerOptions<T>,
 * ): Reducer<T, U>;
 * ```
 *
 * Reducers are signals that emulate the behavior of eg. React's `useReducer` or Redux Stores.
 *
 * ## Example
 *
 * ```ts
 * import { reducer } from "@monstermann/signals";
 *
 * type Action = { type: "inc" } | { type: "dec" };
 *
 * // Create:
 * const count = reducer<number, Action>(0, (count, action) => {
 *     if (action.type === "inc") return count + 1;
 *     if (action.type === "dec") return count - 1;
 *     return count;
 * });
 *
 * // Dispatch:
 * count({ type: "inc" });
 *
 * // Read:
 * count(); // 1
 * ```
 *
 * ## Options
 *
 * ```ts
 * reducer(initialState, reduce, {
 *     // Provide a custom comparator (runs after a basic === check):
 *     equals(before, after) {
 *         return true;
 *     },
 *     // Do something before this reducer is being read from:
 *     onRead() {},
 *     // Do something when this reducer is being watched (memo/effect):
 *     onWatch() {
 *         // Do something when this reducer is no longer being watched:
 *         return () => {};
 *     },
 * });
 * ```
 */
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
