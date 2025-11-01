import { defineConfig } from "@monstermann/barrels"
import { namespace } from "@monstermann/barrels-namespace"

export default defineConfig([
    namespace({
        entries: "./packages/signals-tui/src/*",
        exclude: ["**/internals.ts"],
    }),
])
