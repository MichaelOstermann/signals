import type { Signal } from "@monstermann/signals"
import type { ModalStatus } from "./types"

export const keysToStatus = new Map<string, Signal<ModalStatus>>()

// The status of each modal itself, as another modal can exist with the same key.
export const modalsToStatus = new WeakMap<object, Signal<ModalStatus>>()
