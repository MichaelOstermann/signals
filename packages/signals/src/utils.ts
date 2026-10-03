import type { MaybeDispose } from "./disposer"
import type { Memo } from "./memo"
import type { ReadonlySignal, Signal } from "./signal"
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

export function onCleanup<T extends MaybeDispose>(onDispose: T): T {
    cleanupCtx()?.(onDispose)
    return onDispose
}

export function peek<T>(target: MaybeReactive<T>): T {
    pauseTracking()

    try { return read(target) }
    finally { resumeTracking() }
}
