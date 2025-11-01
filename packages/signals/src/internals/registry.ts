import type { Meta } from "../meta"
import { isDisposer, onDispose } from "../disposer"

export type RegistryEntry = { meta: Meta }

export interface Registry<T extends RegistryEntry> extends Map<number, WeakRef<T>> {
    finalizer: FinalizationRegistry<number>
}

export function registry<T extends RegistryEntry>(): Registry<T> {
    const registry = new Map() as Registry<T>
    registry.finalizer = new FinalizationRegistry(id => registry.delete(id))
    return registry
}

export function register<T extends RegistryEntry>(registry: Registry<T>, value: NoInfer<T>): void {
    if (value.meta.internal) return
    const id = value.meta.id
    const ref = new WeakRef(value)
    registry.finalizer.register(value, id, ref)
    if (isDisposer(value)) onDispose(value, () => registry.delete(id))
}

export function toList<T extends RegistryEntry>(registry: Registry<T>): () => T[] {
    return function () {
        const result: T[] = []
        for (const [id, ref] of registry) {
            const value = ref.deref()
            if (value) result.push(value)
            else registry.delete(id)
        }
        return result
    }
}
