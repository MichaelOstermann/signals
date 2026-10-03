import { describe, expect, it, vi } from "bun:test"
import { dispose, disposed, disposer, effect, isDisposed, onDispose, signal } from "../src"

describe("disposer", () => {
    it("should collect and run cleanups in reverse order", () => {
        const order: number[] = []
        const d = disposer(() => order.push(1))
        d(() => order.push(2))
        onDispose(d, () => order.push(3))

        expect(isDisposed(d)).toBe(false)
        d()
        expect(isDisposed(d)).toBe(true)
        expect(order).toEqual([3, 2, 1])

        d()
        expect(order).toEqual([3, 2, 1])
    })

    it("should run cleanups right away when already disposed", () => {
        const spy = vi.fn()
        onDispose(disposed, spy)
        expect(isDisposed(disposed)).toBe(true)
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it("should dispose other disposers", () => {
        const a = signal(0)
        const spy = vi.fn(() => void a())
        const d = disposer(effect(spy))

        dispose(d)
        a(1)

        expect(spy).toHaveBeenCalledTimes(1)
    })

    it("should be batched and untracked", () => {
        const a = signal(0)
        const b = signal(0)
        const spy = vi.fn(() => void (a() + b()))
        effect(spy)

        const d = disposer(() => {
            a(1)
            b(1)
            expect(spy).toHaveBeenCalledTimes(1)
        })
        const outer = vi.fn(() => d())
        effect(outer)

        expect(spy).toHaveBeenCalledTimes(2)
        a(2)
        expect(outer).toHaveBeenCalledTimes(1)
    })
})
