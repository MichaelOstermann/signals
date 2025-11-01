import { Dsp } from "@monstermann/dsp"
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

export function disposer(...cleanups: MaybeDispose[]): Disposer {
    const disposer = mixinDisposer((...args: [] | [onDispose?: MaybeDispose]) =>
        args.length ? onDispose(disposer, args[0]) : dispose(disposer))
    cleanups.forEach(cleanup => onDispose(disposer, cleanup))
    return disposer
}

export function mixinDisposer<T extends object>(target: T): T & DisposerMixin {
    (target as T & DisposerMixin)[DISPOSER] = Dsp.create()
    return target as T & DisposerMixin
}

export function isDisposer(target: unknown): target is DisposerMixin {
    return target != null && typeof target === "object" && DISPOSER in target
}

export function isDisposed(target: DisposerMixin): boolean {
    return Dsp.isDisposed(target[DISPOSER])
}

export function onDispose<T extends MaybeDispose>(target: DisposerMixin, onDispose: T): T {
    onDispose && Dsp.add(target[DISPOSER], DISPOSER in onDispose ? onDispose[DISPOSER] : onDispose)
    return onDispose
}

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

export const disposed = mixinDisposer(() => {})
dispose(disposed)
