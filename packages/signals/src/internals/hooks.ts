import type { HookEvent } from "../hooks"
import { Dll } from "@monstermann/dll"

export const subscriptions: Dll<(event: HookEvent) => void> = Dll.create()
const errors = new WeakSet<Error>()

export function emit(message: HookEvent): void {
    if (message.name === "ERROR" && errors.has(message.error)) return
    if (message.name === "ERROR") errors.add(message.error)
    if (!subscriptions.tail) return
    let link = subscriptions.head
    while (link) {
        const callback = link.value
        link = link.next
        callback(message)
    }
}
