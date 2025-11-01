import dll from "@monstermann/unplugin-dll/rolldown"
import dsp from "@monstermann/unplugin-dsp/rolldown"
import { defineConfig } from "tsdown"

export default defineConfig({
    clean: true,
    entry: ["./index.ts"],
    format: "esm",
    plugins: [dll({}), dsp({})],
    unbundle: true,
})
