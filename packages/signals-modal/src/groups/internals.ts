import { memo, signal } from "@monstermann/signals"

export const $keysToGroups = signal<Map<string, Set<string>>>(new Map(), {
    mutable: true,
})

export const $groupsToKeys = memo<ReadonlyMap<string, ReadonlySet<string>>>(() => {
    const map = new Map<string, Set<string>>()
    for (const [key, groups] of $keysToGroups()) {
        for (const group of groups) {
            if (!map.has(group)) map.set(group, new Set())
            map.get(group)!.add(key)
        }
    }
    return map
})
