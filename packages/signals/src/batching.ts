import { endBatch, isBatching, startBatch } from "./system"

export function batch<T>(fn: () => T): T {
    if (isBatching()) return fn()
    startBatch()

    try { return fn() }
    finally { endBatch() }
}
