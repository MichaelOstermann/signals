import { describe, expect, it, vi } from "bun:test"
import { action, effect, onAction, onCleanup, signal } from "../src"

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

    it("should have metadata", () => {
        expect(action(() => {}).meta).toEqual({ line: 0, name: "", path: "" })
        expect(action(() => {}, { name: "save" }).meta).toEqual({ line: 0, name: "save", path: "" })
        expect(action(() => {}, { hmr: new Set(), line: 3, name: "save", path: "src/save.ts" }).meta)
            .toEqual({ line: 3, name: "save", path: "src/save.ts" })
    })
})

describe("onAction", () => {
    it("should be called before an action runs", () => {
        const order: string[] = []
        const save = action((a: number, b: string) => void order.push(`run ${a} ${b}`), { name: "save" })
        const dispose = onAction((action, args) => void order.push(`${action.meta.name} ${args.join(" ")}`))

        save(1, "a")
        expect(order).toEqual(["save 1 a", "run 1 a"])

        dispose()
        save(2, "b")
        expect(order).toEqual(["save 1 a", "run 1 a", "run 2 b"])
    })

    it("should only keep the latest listener", () => {
        const first = vi.fn()
        const second = vi.fn()
        const run = action(() => {})

        const disposeFirst = onAction(first)
        const disposeSecond = onAction(second)
        run()
        expect(first).toHaveBeenCalledTimes(0)
        expect(second).toHaveBeenCalledTimes(1)

        // Does not remove the listener that replaced it.
        disposeFirst()
        run()
        expect(second).toHaveBeenCalledTimes(2)

        disposeSecond()
        run()
        expect(second).toHaveBeenCalledTimes(2)
    })
})
