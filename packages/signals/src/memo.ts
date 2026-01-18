import type { Dispose } from "./disposer"
import type { Meta, MetaOptions, UnpluginMeta } from "./meta"
import { emit } from "./internals/hooks"
import { isKind } from "./internals/isKind"
import { createMeta } from "./internals/meta"
import { register, registry, toList } from "./internals/registry"
import { defer, run } from "./internals/runner"
import { MEMO } from "./symbols"
import { RawMemo } from "./system"

export interface Memo<T = any> {
    (): T
    kind: MEMO
    meta: Meta
}

export interface MemoOptions<T> extends MetaOptions {
    equals?: (before: T, after: T) => boolean
    onWatch?: () => Dispose | void
}

const memos = registry<Memo>()
export const isMemo = isKind<Memo>(MEMO)
export const getMemos = toList(memos)

export function memo<T>(
    computation: () => T,
    options?: MemoOptions<NoInfer<T>>,
    _meta?: UnpluginMeta,
): Memo<T> {
    let init = false
    let prev: T | undefined
    const meta = createMeta("Memo", options, _meta)
    let memo: Memo<T>

    const m = new RawMemo<T>(() => run(() => {
        let next: T
        let equal: boolean
        if (!meta.silent) {
            emit({ memo, name: "MEMO_START", value: prev })
            defer(() => emit({ equal, memo, name: "MEMO_END", value: next }))
        }
        next = computation()
        equal = init && (prev === next || options?.equals?.(next, prev!) === true)
        init = true
        if (!equal) prev = next
        return prev!
    }), options)

    memo = m.get.bind(m) as Memo<T>
    memo.kind = MEMO
    memo.meta = meta
    register(memos, memo)

    return memo
}

export interface MemoIndex<K, V> extends Memo<ReadonlyMap<K, V>> {
    for: (key: K) => Memo<V | undefined>
    get: (key: K) => V | undefined
}

export function indexed<T, K, V>(
    target: () => T[],
    by: (value: NoInfer<T>) => [K, V],
    options?: MemoOptions<V>,
    _meta?: UnpluginMeta,
): MemoIndex<K, V> {
    const cache = new Map<K, WeakRef<Memo<V | undefined>>>()
    const finalizers = new FinalizationRegistry<{ key: K, ref: WeakRef<Memo<V | undefined>> }>(
        ({ key, ref }) => {
            if (cache.get(key) === ref) {
                cache.delete(key)
            }
        },
    )

    const index = memo<Map<K, V>>((prevIdx = new Map()) => {
        let hasChanges = false
        const nextIdx = new Map<K, V>()
        for (const entry of target()) {
            const [key, nextVal] = by(entry)
            const prevVal = prevIdx.get(key)
            hasChanges ||= !(prevIdx.has(key) && (nextVal === prevVal || options?.equals?.(nextVal, prevVal!)))
            nextIdx.set(key, nextVal)
        }
        hasChanges ||= nextIdx.size !== prevIdx.size
        return hasChanges ? nextIdx : prevIdx
    }, { ...options, equals: undefined }, _meta) as unknown as MemoIndex<K, V>

    index.for = function (key) {
        const existing = cache.get(key)?.deref()
        if (existing) return existing
        const c = memo(() => index().get(key))
        const ref = new WeakRef(c)
        cache.set(key, ref)
        finalizers.register(c, { key, ref })
        return c
    }

    index.get = key => index.for(key)()

    return index
}
