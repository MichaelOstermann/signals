import { describe, expect, it, vi } from "bun:test"
import { action, effect, onCleanup, signal } from "../src"

describe("action", () => {
    it("should pass arguments and return the result", () => {
        const add = action((a: number, b: number) => a + b)
        expect(add(1, 2)).toBe(3)
    })

    it("should be batched", () => {
        const a = signal(0)
        const b = signal(0)
        const spy = vi.fn(() => void (a() + b()))
        effect(spy)

        action(() => {
            a(1)
            b(1)
            expect(spy).toHaveBeenCalledTimes(1)
        })()

        expect(spy).toHaveBeenCalledTimes(2)
    })

    it("should be untracked", () => {
        const a = signal(0)
        const read = action(() => a())
        const spy = vi.fn(() => void read())
        effect(spy)

        a(1)
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it("should restore batching and tracking when the handler throws", () => {
        const a = signal(0)
        const spy = vi.fn(() => void a())
        const fail = action(() => {
            a(1)
            throw new Error("fail")
        })

        effect(() => {
            expect(fail).toThrow("fail")
            spy()
        })

        expect(spy).toHaveBeenCalledTimes(1)
        a(2)
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it("should run cleanups before the next call", () => {
        const spy = vi.fn()
        const run = action(() => void onCleanup(spy))

        run()
        expect(spy).toHaveBeenCalledTimes(0)
        run()
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
