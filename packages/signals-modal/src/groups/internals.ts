export const keysToGroups = new Map<string, Set<string>>()
export const groupsToKeys = new Map<string, Set<string>>()

// The groups of each modal itself, as another modal can exist with the same key.
const modalsToGroups = new WeakMap<object, Set<string>>()

export function addGroups(modal: object, key: string, groups: Iterable<string>): { created: boolean, groups: Set<string> } {
    let groupsOfModal = modalsToGroups.get(modal)
    const created = !groupsOfModal

    if (!groupsOfModal) {
        // A later modal with the same key takes over.
        const previous = keysToGroups.get(key)
        if (previous) removeGroups(key, previous)
        groupsOfModal = new Set()
        modalsToGroups.set(modal, groupsOfModal)
        keysToGroups.set(key, groupsOfModal)
    }

    for (const group of groups) {
        groupsOfModal.add(group)
        let keys = groupsToKeys.get(group)
        if (!keys) groupsToKeys.set(group, keys = new Set())
        keys.add(key)
    }

    return { created, groups: groupsOfModal }
}

export function removeGroups(key: string, groupsOfModal: Set<string>): void {
    // A later modal with the same key has its own groups.
    if (keysToGroups.get(key) !== groupsOfModal) return
    keysToGroups.delete(key)

    for (const group of groupsOfModal) {
        const keys = groupsToKeys.get(group)
        if (!keys) continue
        keys.delete(key)
        if (!keys.size) groupsToKeys.delete(group)
    }
}
