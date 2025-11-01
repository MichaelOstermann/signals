import { endBatch, isBatching, startBatch } from "./system"

export function batch<T>(fn: () => T): T {
    if (isBatching()) return fn()
    startBatch()
    // eslint-disable-next-line @stylistic/max-statements-per-line
    try { return fn() }
    finally { endBatch() }
}
