import type { Signal } from "@monstermann/signals"
import type { ModalStatus } from "./types"
import { signal } from "@monstermann/signals"

export const $keysToStatus = signal<Map<string, Signal<ModalStatus>>>(new Map(), {
    mutable: true,
})
