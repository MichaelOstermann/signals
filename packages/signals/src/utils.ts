import type { MaybeDispose } from "./disposer"
import type { ReadonlyEmitter } from "./emitter"
import type { Memo } from "./memo"
import type { ReadonlyReducer } from "./reducer"
import type { ReadonlySignal, Signal } from "./signal"
import { cleanupCtx } from "./internals/contexts"
import { pauseTracking, resumeTracking } from "./system"

export type Reactive<T> =
    | Memo<T>
    | Signal<T>
    | ReadonlySignal<T>

export type MaybeReactive<T> =
    | Reactive<T>
    | T

export const INTERNAL = { internal: true } as const
export const SILENT = { silent: true } as const

export function onCleanup<T extends MaybeDispose>(onDispose: T): T {
    cleanupCtx()?.(onDispose)
    return onDispose
}

export function asReadonly<T>(target: ReadonlySignal<T>): ReadonlySignal<T>
export function asReadonly<T>(target: ReadonlyEmitter<T>): ReadonlyEmitter<T>
export function asReadonly<T>(target: ReadonlyReducer<T>): ReadonlyReducer<T>
export function asReadonly<T>(target: ReadonlySignal<T> | ReadonlyEmitter<T> | ReadonlyReducer<T>): ReadonlySignal<T> | ReadonlyEmitter<T> | ReadonlyReducer<T> {
    return target
}

export function isReactive(value: unknown): value is Reactive<unknown> {
    return value != null
        && typeof value === "object"
        && "meta" in value
}

export function read<T>(target: MaybeReactive<T>): T {
    if (typeof target === "function") return (target as () => T)()
    return target
}

export function readOr<T>(target: MaybeReactive<T> | undefined, or: MaybeReactive<T>): T {
    return target == null ? read(or) : read(target)
}

export function peek<T>(target: MaybeReactive<T>): T {
    pauseTracking()
    // eslint-disable-next-line @stylistic/max-statements-per-line
    try { return read(target) }
    finally { resumeTracking() }
}

export function peekOr<T>(target: MaybeReactive<T> | undefined, or: MaybeReactive<T>): T {
    pauseTracking()
    // eslint-disable-next-line @stylistic/max-statements-per-line
    try { return readOr(target, or) }
    finally { resumeTracking() }
}
