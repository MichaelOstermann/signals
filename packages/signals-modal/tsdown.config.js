import { fn } from "@monstermann/fn-transform"
import { defineConfig } from "tsdown"

export default defineConfig({
    clean: true,
    dts: true,
    entry: ["./src/index.ts"],
    format: "esm",
    plugins: [fn()],
    unbundle: true,
})
