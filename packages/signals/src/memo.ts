import type { Dispose } from "./disposer"
import { MEMO } from "./symbols"
import { RawMemo } from "./system"

export interface Memo<T = any> {
    (): T
    kind: MEMO
}

export interface MemoOptions<T> {
    equals?: (before: T, after: T) => boolean
    onWatch?: () => Dispose | void
}

export function memo<T>(
    computation: () => T,
    options?: MemoOptions<NoInfer<T>>,
): Memo<T> {
    const equals = options?.equals
    let init = false
    let prev: T

    const m = new RawMemo<T>(equals
        ? () => {
                const next = computation()
                if (init && equals(prev, next)) return prev
                init = true
                return prev = next
            }
        : computation, options)

    const memo = m.get.bind(m) as Memo<T>
    memo.kind = MEMO

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
): MemoIndex<K, V> {
    const equals = options?.equals
    const cache = new Map<K, WeakRef<Memo<V | undefined>>>()
    const finalizers = new FinalizationRegistry<{ key: K, ref: WeakRef<Memo<V | undefined>> }>(
        ({ key, ref }) => {
            if (cache.get(key) === ref) {
                cache.delete(key)
            }
        },
    )

    let prevIdx = new Map<K, V>()
    const index = memo<Map<K, V>>(() => {
        let hasChanges = false
        const nextIdx = new Map<K, V>()
        for (const entry of target()) {
            const [key, nextVal] = by(entry)
            if (!hasChanges) {
                const prevVal = prevIdx.get(key) as V
                hasChanges = !prevIdx.has(key) || !(prevVal === nextVal || equals?.(prevVal, nextVal) === true)
            }
            nextIdx.set(key, nextVal)
        }
        hasChanges ||= nextIdx.size !== prevIdx.size
        return hasChanges ? prevIdx = nextIdx : prevIdx
    }, { onWatch: options?.onWatch }) as unknown as MemoIndex<K, V>

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
