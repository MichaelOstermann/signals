import { describe, expect, it, vi } from "bun:test"
import { effect, reducer } from "../src"

type Action =
    | { type: "inc" }
    | { type: "noop" }

describe("reducer", () => {
    it("should reduce actions", () => {
        const count = reducer(0, (state, action: Action) => action.type === "inc" ? state + 1 : state)
        const spy = vi.fn(() => void count())
        effect(spy)

        count({ type: "inc" })
        expect(count()).toBe(1)
        expect(spy).toHaveBeenCalledTimes(2)

        count({ type: "noop" })
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it("should use equals", () => {
        const state = reducer({ count: 0 }, (state, action: Action) => ({ count: action.type === "inc" ? state.count + 1 : state.count }), {
            equals: (before, after) => before.count === after.count,
        })
        const before = state()

        state({ type: "noop" })
        expect(state()).toBe(before)

        state({ type: "inc" })
        expect(state()).toEqual({ count: 1 })
    })
})
