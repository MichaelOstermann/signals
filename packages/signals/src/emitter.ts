import type { Dispose, DisposerMixin } from "./disposer"
import type { Meta, MetaOptions, UnpluginMeta } from "./meta"
import type { Signal } from "./signal"
import { Dll } from "@monstermann/dll"
import { disposed, isDisposed, mixinDisposer, onDispose } from "./disposer"
import { effect } from "./effect"
import { hmr } from "./internals/hmr"
import { emit } from "./internals/hooks"
import { isKind } from "./internals/isKind"
import { createMeta } from "./internals/meta"
import { register, registry, toList } from "./internals/registry"
import { defer, deferBatch, deferUntrack, run } from "./internals/runner"
import { signal } from "./signal"
import { EMITTER } from "./symbols"
import { untrack } from "./tracking"
import { peek } from "./utils"

export interface EmitterCallback<T = any> {
    (message: T): void
}

export interface ReadonlyEmitter<T = any> extends DisposerMixin, Dll<(message: T) => void> {
    (onMessage: EmitterCallback<T>): Dispose
    empty: Signal<boolean>
    kind: EMITTER
    meta: Meta
    handler: (emitter: Emitter<T>, message: T) => void
}

export interface Emitter<T = any> extends ReadonlyEmitter<T> {
    (message: T): void
}

export interface EmitterOptions<T = any> extends MetaOptions {
    handler?: (emitter: Emitter<T>, message: T) => void
    onWatch?: () => Dispose | void
}

const emitters = registry<Emitter>()
export const isEmitter = isKind<Emitter>(EMITTER)
export const getEmitters = toList(emitters)

export function emitter<T = void>(
    options?: EmitterOptions<T>,
    _meta?: UnpluginMeta,
): Emitter<T> {
    const emitter = mixinDisposer((a: any) =>
        typeof a === "function"
            ? on(emitter, a)
            : send(emitter, a),
    ) as Emitter<T>
    emitter.kind = EMITTER
    emitter.meta = createMeta("Emitter", options, _meta)
    emitter.empty = signal(false)
    emitter.handler = options?.handler ?? defaultHandler

    const onWatch = options?.onWatch
    if (onWatch) {
        onDispose(emitter, effect(() => {
            if (emitter.empty()) return
            return untrack(onWatch)
        }))
    }

    register(emitters, emitter)
    hmr(emitter)
    return emitter
}

function defaultHandler<T>(emitter: Emitter<T>, message: T): void {
    for (let link = emitter.head; link; link = link.next) link.value(message)
}

function on<T>(emitter: Emitter<T>, onMessage: EmitterCallback<T>): Dispose {
    if (isDisposed(emitter)) return disposed
    const l = Dll.append(emitter, onMessage)
    emitter.empty(false)
    return onDispose(emitter, () => {
        Dll.unlink(emitter, l)
        emitter.empty(!emitter.head)
    })
}

function send<T>(emitter: Emitter<T>, message: T): void {
    if (peek(emitter.empty) || isDisposed(emitter)) return
    return run(() => {
        deferBatch()
        deferUntrack()
        if (!emitter.meta.silent) {
            emit({ emitter, message, name: "EMITTER_START" })
            defer(() => emit({ emitter, name: "EMITTER_END" }))
        }
        emitter.handler(emitter, message)
    })
}
