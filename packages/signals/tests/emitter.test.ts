import { describe, expect, it, vi } from "bun:test"
import { dispose, DISPOSER, effect, emitter, isDisposed, signal } from "../src"

describe("emitter", () => {
    it("should send messages to listeners", () => {
        const onMessage = emitter<number>()
        const a = vi.fn()
        const b = vi.fn()
        onMessage(a)
        onMessage(b)

        onMessage(1)

        expect(a).toHaveBeenCalledWith(1)
        expect(b).toHaveBeenCalledWith(1)
    })

    it("should stop sending messages after unsubscribing", () => {
        const onMessage = emitter<number>()
        const a = vi.fn()
        const b = vi.fn()
        const unsubscribe = onMessage(a)
        onMessage(b)

        unsubscribe()
        onMessage(1)

        expect(a).toHaveBeenCalledTimes(0)
        expect(b).toHaveBeenCalledTimes(1)
    })

    it("should not keep anything around after unsubscribing", () => {
        const onMessage = emitter<number>()
        for (let i = 0; i < 1000; i++) onMessage(() => {})()
        expect(onMessage.listeners.size).toBe(0)

        // Subscriptions used to leave an entry behind in the disposer of the emitter.
        let entries = 0
        for (let link = onMessage[DISPOSER].vals; link; link = link.prevVal) entries++
        expect(entries).toBe(1)
    })

    it("should not remove other listeners when unsubscribing twice", () => {
        const onMessage = emitter<number>()
        const a = vi.fn()
        const b = vi.fn()
        const unsubscribe = onMessage(a)
        unsubscribe()
        onMessage(b)
        unsubscribe()

        onMessage(1)

        expect(a).toHaveBeenCalledTimes(0)
        expect(b).toHaveBeenCalledTimes(1)
    })

    it("should skip listeners that are removed while sending", () => {
        const onMessage = emitter<number>()
        const order: string[] = []
        const unsubscribe: (() => void)[] = []
        onMessage(() => {
            order.push("a")
            unsubscribe.forEach(fn => fn())
        })
        unsubscribe.push(onMessage(() => void order.push("b")))
        onMessage(() => void order.push("c"))

        onMessage(1)

        expect(order).toEqual(["a", "c"])
    })

    it("should count the same listener once", () => {
        const onMessage = emitter<number>()
        const a = vi.fn()
        onMessage(a)
        onMessage(a)

        onMessage(1)

        expect(a).toHaveBeenCalledTimes(1)
    })

    it("should be batched and untracked", () => {
        const onMessage = emitter()
        const a = signal(0)
        const b = signal(0)
        const spy = vi.fn(() => void (a() + b()))
        effect(spy)

        onMessage(() => {
            a(1)
            b(1)
            expect(spy).toHaveBeenCalledTimes(1)
        })

        const outer = vi.fn(() => onMessage())
        effect(outer)
        expect(spy).toHaveBeenCalledTimes(2)

        a(2)
        expect(outer).toHaveBeenCalledTimes(1)
    })

    it("should drop listeners when disposed", () => {
        const onMessage = emitter<number>()
        const a = vi.fn()
        const b = vi.fn()
        onMessage(a)

        dispose(onMessage)
        onMessage(b)()
        onMessage(1)

        expect(isDisposed(onMessage)).toBe(true)
        expect(onMessage.listeners.size).toBe(0)
        expect(a).toHaveBeenCalledTimes(0)
        expect(b).toHaveBeenCalledTimes(0)
    })

    it("should be disposed when its module is replaced", () => {
        const hmr = new Set<() => void>()
        const onMessage = emitter<number>({ hmr })
        const a = vi.fn()
        onMessage(a)

        expect(hmr.size).toBe(1)
        for (const cb of hmr) cb()
        onMessage(1)

        expect(hmr.size).toBe(0)
        expect(a).toHaveBeenCalledTimes(0)
    })
})
