import type { MaybeReactive } from "../utils"

export function read<T>(target: MaybeReactive<T>): T {
    if (typeof target === "function") return (target as () => T)()
    return target
}
