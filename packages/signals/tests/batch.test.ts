import { describe, expect, it, vi } from "bun:test"
import { batch, effect, memo, signal, untrack } from "../src"

describe("batch", () => {
    it("should not rerun effects when a signal is back to its value", () => {
        const a = signal(1)
        const spy = vi.fn(() => void a())
        effect(spy)

        batch(() => {
            a(2)
            a(1)
        })
        expect(spy).toHaveBeenCalledTimes(1)

        batch(() => {
            a(2)
            a(3)
        })
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it("should not recompute memos when a signal is back to its value", () => {
        const a = signal(1)
        const compute = vi.fn(() => a() * 2)
        const m = memo(compute)
        const spy = vi.fn(() => void m())
        effect(spy)

        batch(() => {
            a(2)
            a(1)
        })

        expect(compute).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it("should rerun when another signal did change", () => {
        const a = signal(1)
        const b = signal(1)
        const spy = vi.fn(() => void (a() + b()))
        effect(spy)

        batch(() => {
            a(2)
            b(2)
            a(1)
        })

        expect(spy).toHaveBeenCalledTimes(2)
    })

    it("should not return stale values from memos that have been read in between", () => {
        const a = signal(1)
        const m = memo(() => a() * 2)

        batch(() => {
            a(2)
            expect(m()).toBe(4)
            a(1)
        })
        expect(m()).toBe(2)

        a(2)
        expect(m()).toBe(4)
    })

    it("should rerun for mutable signals that keep their value", () => {
        const list: number[] = []
        const a = signal(list, { mutable: true })
        const spy = vi.fn(() => void a())
        effect(spy)

        batch(() => {
            list.push(1)
            a(list)
        })
        expect(spy).toHaveBeenCalledTimes(2)

        batch(() => {
            a([])
            list.push(2)
            a(list)
        })
        expect(spy).toHaveBeenCalledTimes(3)
    })

    it("should handle writes to the same signal in nested batches", () => {
        const a = signal(1)
        const spy = vi.fn(() => void a())
        effect(spy)

        batch(() => {
            a(2)
            batch(() => a(3))
            a(1)
        })

        expect(spy).toHaveBeenCalledTimes(1)
        a(2)
        expect(spy).toHaveBeenCalledTimes(2)
    })
})

describe("untrack", () => {
    it("should not track inside effects", () => {
        const a = signal(0)
        const b = signal(0)
        const spy = vi.fn(() => void (a() + untrack(() => untrack(b))))
        effect(spy)

        b(1)
        expect(spy).toHaveBeenCalledTimes(1)
        a(1)
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it("should resume tracking afterwards, also when throwing", () => {
        const a = signal(0)
        const spy = vi.fn(() => {
            try {
                untrack(() => {
                    throw new Error("fail")
                })
            }
            catch {}
            a()
        })
        effect(spy)

        a(1)
        expect(spy).toHaveBeenCalledTimes(2)
    })
})
