import { describe, expect, it } from "bun:test"
import { signals, transform } from "../src"

const code = `
import { action, deferEffect, effect, emitter, memo, signal, watch } from "@monstermann/signals"

const count = signal(0)
const double = memo(() => count() * 2)
const onChange = emitter()
const increment = action(() => count(n => n + 1))
effect(() => console.log(count()))
watch(count, () => onChange())
deferEffect(resolve => resolve())
`

describe("transform", () => {
    it("should do nothing without hmr", () => {
        expect(transform(code, "source.ts")).toBe(undefined)
    })

    it("should skip files that do not import signals", () => {
        expect(transform(`import { effect } from "lib"\neffect(() => {})`, "source.ts", { hmr: true })).toBe(undefined)
    })

    it("should make effects, watchers and emitters disposable with hmr", () => {
        const result = transform(code, "source.ts", { hmr: true })?.code
        expect(result).toContain("import.meta.hot")
        expect(result).toContain("signal(0)")
        expect(result).toContain("memo(() => count() * 2)")
        expect(result).toContain("action(() => count(n => n + 1))")
        expect(result).toContain("deferEffect(resolve => resolve())")
        expect(result).toContain("const meta = { hmr: hmr };")
        expect(result).not.toContain("meta1")
        expect(result).not.toContain("path")
        expect(result).toContain("emitter(meta)")
        expect(result).toContain("effect(() => console.log(count()), meta)")
        expect(result).toContain("watch(count, () => onChange(), undefined, meta)")
    })
})

describe("signals", () => {
    it("should skip files that are excluded or not included", () => {
        const plugin = signals({ exclude: /skipped/, hmr: true })
        expect(plugin.transform.handler(code, "/a/b.ts")?.code).toContain("import.meta.hot")
        expect(plugin.transform.handler(code, "/a/skipped.ts")).toBe(undefined)
        expect(plugin.transform.handler(code, "/a/b.css")).toBe(undefined)
    })

    it("should enable hmr for the dev server of Vite", () => {
        const plugin = signals()
        expect(plugin.transform.handler(code, "/a/b.ts")).toBe(undefined)
        plugin.configResolved({ command: "serve" })
        expect(plugin.transform.handler(code, "/a/b.ts")?.code).toContain("import.meta.hot")
    })
})
