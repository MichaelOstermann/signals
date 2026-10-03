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

/**
 * # memo
 *
 * ```ts
 * function memo<T>(computation: () => T, options?: MemoOptions<T>): Memo<T>;
 * ```
 *
 * Memos are functions that can compose/derive other signals. They are lazy in that they only refresh when they are being read from or subscribed to.
 *
 * ## Example
 *
 * ```ts
 * import { signal, memo } from "@monstermann/signals";
 *
 * const count = signal(1);
 *
 * // Create:
 * const double = memo(() => count() * 2);
 *
 * // Read:
 * double(); // 2
 * ```
 *
 * ## Options
 *
 * ```ts
 * memo(computation, {
 *     // Provide a custom comparator (runs after a basic === check):
 *     equals(before, after) {
 *         return true;
 *     },
 *     // Do something when this memo is being watched (memo/effect):
 *     onWatch() {
 *         // Do something when this memo is no longer being watched:
 *         return () => {};
 *     },
 * });
 * ```
 */
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
                if (init && (prev === next || equals(prev, next))) return prev
                init = true
                return prev = next
            }
        : computation, options)

    const memo = (() => m.get()) as Memo<T>
    memo.kind = MEMO

    return memo
}

export interface MemoIndex<K, V> extends Memo<ReadonlyMap<K, V>> {
    for: (key: K) => Memo<V | undefined>
    get: (key: K) => V | undefined
}

/**
 * # indexed
 *
 * ```ts
 * function indexed<T, K, V>(
 *     target: () => T[],
 *     by: (value: T) => [K, V],
 *     options?: MemoOptions<V>,
 * ): MemoIndex<K, V>;
 * ```
 *
 * Creates a `memo` by indexing a list into a `Map<K, V>`. The previous map is kept when none of its entries changed, `equals` compares the values of an entry.
 *
 * `for(key)` returns a `memo` for a single entry, which allows you to subscribe to individual entries from a list, instead of the entire thing. They are created lazily and held weakly.
 *
 * ## Example
 *
 * ```ts
 * import { signal, indexed } from "@monstermann/signals";
 *
 * const people = signal<Person[]>([{ id: 0, name: "John Doe" }]);
 *
 * const peopleIdx = indexed(people, (person) => [person.id, person]);
 *
 * peopleIdx(); // ReadonlyMap<number, Person>
 *
 * peopleIdx.for(0); // Memo<Person | undefined>
 *
 * peopleIdx.get(0); // Person | undefined
 * ```
 */
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
            if (prevIdx.has(key)) {
                const prevVal = prevIdx.get(key) as V
                // Equal entries keep their previous value, so what reads them does not see a change.
                if (prevVal === nextVal || equals?.(prevVal, nextVal) === true) {
                    nextIdx.set(key, prevVal)
                    continue
                }
            }
            hasChanges = true
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
