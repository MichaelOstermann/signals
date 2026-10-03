import { endBatch, isBatching, startBatch } from "./system"

/**
 * # batch
 *
 * ```ts
 * function batch<T>(fn: () => T): T;
 * ```
 *
 * Batches `Signal` updates into one for the duration of the provided callback.
 *
 * A signal that is back to the value it had before the batch does not update anything.
 *
 * ## Example
 *
 * ```ts
 * import { signal, effect, batch } from "@monstermann/signals";
 *
 * const a = signal(0);
 * const b = signal(0);
 *
 * effect(() => console.log(a(), b()));
 *
 * // Prints: 1, 0
 * a(1);
 *
 * // Prints: 1, 1
 * b(1);
 *
 * // Prints: 2, 2
 * batch(() => {
 *     a(2);
 *     b(2);
 * });
 * ```
 */
export function batch<T>(fn: () => T): T {
    if (isBatching()) return fn()
    startBatch()

    try { return fn() }
    finally { endBatch() }
}
