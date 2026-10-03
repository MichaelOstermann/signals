import { describe, expect, it, vi } from "bun:test"
import { currentEffect, deferEffect, dispose, disposeEffect, effect, hasEffect, isDisposed, onCleanup, signal } from "../src"

describe("effect", () => {
    it("should unsubscribe from everything when disposed while running", () => {
        const onUnwatch = vi.fn()
        const a = signal(0, { onWatch: () => onUnwatch })
        const b = signal(0, { onWatch: () => onUnwatch })
        const spy = vi.fn(() => {
            if (a() + b() > 0) disposeEffect()
        })
        const fx = effect(spy)

        a(1)
        expect(isDisposed(fx)).toBe(true)
        expect(onUnwatch).toHaveBeenCalledTimes(2)

        b(1)
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it("should unsubscribe from everything when disposed during the first run", () => {
        const onUnwatch = vi.fn()
        const a = signal(0, { onWatch: () => onUnwatch })
        const b = signal(0, { onWatch: () => onUnwatch })
        const spy = vi.fn(() => {
            a()
            disposeEffect()
            b()
        })
        effect(spy)

        expect(onUnwatch).toHaveBeenCalledTimes(2)
        a(1)
        b(1)
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it("should run cleanups before the next run and when disposed", () => {
        const a = signal(0)
        const returned = vi.fn()
        const registered = vi.fn()
        const fx = effect(() => {
            a()
            onCleanup(registered)
            return returned
        })

        a(1)
        expect(returned).toHaveBeenCalledTimes(1)
        expect(registered).toHaveBeenCalledTimes(1)

        fx()
        expect(returned).toHaveBeenCalledTimes(2)
        expect(registered).toHaveBeenCalledTimes(2)
    })

    it("should know the running effect", () => {
        expect(hasEffect()).toBe(false)
        expect(currentEffect()).toBe(undefined)

        const current: unknown[] = []
        const fx = effect(() => {
            expect(hasEffect()).toBe(true)
            current.push(currentEffect())
        })

        expect(current).toEqual([fx])
        expect(hasEffect()).toBe(false)
    })

    it("should rethrow what the computation throws", () => {
        const promise = Promise.resolve()
        let thrown
        try {
            effect(() => {
                throw promise
            })
        }
        catch (error) {
            thrown = error
        }
        expect(thrown).toBe(promise)
        expect(hasEffect()).toBe(false)
    })

    it("should restore the running effect when a cleanup throws", () => {
        const a = signal(0)
        effect(() => {
            a()
            return () => {
                throw new Error("fail")
            }
        })

        expect(() => a(1)).toThrow("fail")
        expect(hasEffect()).toBe(false)
        expect(onCleanup(() => {})).toBeFunction()
    })

    it("should be disposed when its module is replaced", () => {
        const hmr = new Set<() => void>()
        const a = signal(0)
        const spy = vi.fn(() => void a())
        const fx = effect(spy, { hmr, line: 1, name: "", path: "source.ts" })

        for (const cb of hmr) cb()
        a(1)

        expect(isDisposed(fx)).toBe(true)
        expect(hmr.size).toBe(0)
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it("should not keep a reference in hmr when disposed", () => {
        const hmr = new Set<() => void>()
        const fx = effect(() => {}, { hmr, line: 1, name: "", path: "source.ts" })
        expect(hmr.size).toBe(1)
        dispose(fx)
        expect(hmr.size).toBe(0)
    })
})

describe("deferEffect", () => {
    it("should resolve and dispose", async () => {
        const a = signal(0)
        const spy = vi.fn()
        const result = deferEffect<number>((resolve) => {
            spy()
            if (a() > 1) resolve(a())
        })

        a(1)
        a(2)
        expect(await result).toBe(2)

        a(3)
        expect(spy).toHaveBeenCalledTimes(3)
    })
})

describe("cleanups", () => {
    it("should run cleanups of a run that threw when the effect is disposed", () => {
        const a = signal(0)
        const cleanup = vi.fn()
        const fx = effect(() => {
            onCleanup(cleanup)
            if (a() > 0) throw new Error("fail")
        })

        expect(() => a(1)).toThrow("fail")
        expect(cleanup).toHaveBeenCalledTimes(1)

        fx()
        expect(cleanup).toHaveBeenCalledTimes(2)
    })

    it("should run cleanups in reverse order", () => {
        const order: number[] = []
        const fx = effect(() => {
            onCleanup(() => order.push(1))
            onCleanup(() => order.push(2))
            return () => order.push(3)
        })

        fx()
        expect(order).toEqual([3, 2, 1])
    })
})
