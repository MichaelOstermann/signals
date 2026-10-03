import { describe, expect, it, vi } from "bun:test"
import {
    closeModal,
    createModal,
    getModalsForGroup,
    getModalStatus,
    isModalInGroup,
    onModalClosed,
    onModalClosing,
    onModalDisposed,
    onModalOpened,
    onModalOpening,
    openModal,
    setModalStatus,
    withModalGroups,
    withModalStatus,
} from "../src"

describe("createModal", () => {
    it("should return the context and what setup returns", () => {
        const modal = createModal("create", () => ({ value: 1 }))
        expect(modal.key).toBe("create")
        expect(modal.value).toBe(1)
        expect(modal.isDisposed()).toBe(false)
        modal.dispose()
        expect(modal.isDisposed()).toBe(true)
    })

    it("should throw when used outside of createModal", () => {
        expect(() => withModalStatus()).toThrow()
    })

    it("should run cleanups and announce the disposal once", () => {
        const cleanup = vi.fn()
        const disposed = vi.fn()
        const stop = onModalDisposed(key => key === "once" && disposed())
        const modal = createModal("once", () => ({}))
        modal.onDispose(cleanup)

        modal.dispose()
        modal.dispose()
        stop()

        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(disposed).toHaveBeenCalledTimes(1)
    })

    it("should close an open modal before disposing it", () => {
        const modal = createModal("open", () => withModalStatus("opened"))

        modal.dispose()
        expect(modal.$status()).toBe("closing")
        expect(modal.isDisposed()).toBe(false)

        setModalStatus("open", "closed")
        expect(modal.isDisposed()).toBe(true)
        expect(getModalStatus("open")).toBe("closed")
    })

    it("should not announce the disposal of a later modal with the same key", () => {
        const disposed = vi.fn()
        const stop = onModalDisposed(key => key === "reused" && disposed())

        const first = createModal("reused", () => withModalStatus("opened"))
        first.dispose()
        setModalStatus("reused", "closed")
        expect(disposed).toHaveBeenCalledTimes(1)

        const second = createModal("reused", () => withModalStatus("opened"))
        setModalStatus("reused", "closed")
        expect(second.isDisposed()).toBe(false)
        expect(disposed).toHaveBeenCalledTimes(1)

        second.dispose()
        stop()
        expect(disposed).toHaveBeenCalledTimes(2)
    })

    it("should not keep listeners around after disposing open modals", () => {
        const before = onModalClosed.listeners.size
        for (let i = 0; i < 10; i++) {
            const modal = createModal("listeners", () => withModalStatus("opened"))
            modal.dispose()
            modal.dispose()
            setModalStatus("listeners", "closed")
        }
        expect(onModalClosed.listeners.size).toBe(before)
    })
})

describe("withModalStatus", () => {
    it("should open, close and emit", () => {
        const events: string[] = []
        const stops = [
            onModalOpening(key => void events.push(`opening ${key}`)),
            onModalOpened(key => void events.push(`opened ${key}`)),
            onModalClosing(key => void events.push(`closing ${key}`)),
            onModalClosed(key => void events.push(`closed ${key}`)),
        ]
        const modal = createModal("status", () => withModalStatus())
        expect(modal.$status()).toBe("closed")
        expect(modal.$mounted()).toBe(false)

        openModal("status")
        expect(modal.$status()).toBe("opening")
        expect(modal.$isOpen()).toBe(true)
        expect(modal.$mounted()).toBe(true)

        setModalStatus("status", "opened")
        closeModal("status")
        expect(modal.$isOpen()).toBe(false)
        expect(modal.$mounted()).toBe(true)

        setModalStatus("status", "closed")
        modal.toggle()
        expect(modal.$status()).toBe("opening")

        expect(events).toEqual(["opening status", "opened status", "closing status", "closed status", "opening status"])
        stops.forEach(stop => stop())
        setModalStatus("status", "closed")
        modal.dispose()
        expect(getModalStatus("status")).toBe("closed")
    })
})

describe("withModalGroups", () => {
    it("should register and remove groups", () => {
        const a = createModal("group-a", () => ({ $groups: withModalGroups(["menu"]) }))
        const b = createModal("group-b", () => ({ $groups: withModalGroups(["menu", "nested"]) }))

        expect(Array.from(getModalsForGroup("menu"))).toEqual(["group-a", "group-b"])
        expect(Array.from(getModalsForGroup("nested"))).toEqual(["group-b"])
        expect(Array.from(b.$groups())).toEqual(["menu", "nested"])
        expect(isModalInGroup("group-a", "nested")).toBe(false)

        a.dispose()
        expect(Array.from(getModalsForGroup("menu"))).toEqual(["group-b"])
        b.dispose()
        expect(Array.from(getModalsForGroup("menu"))).toEqual([])
    })
})
