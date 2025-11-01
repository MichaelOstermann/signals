import type { MetaPluginOptions } from "./types"
import { setMetaParam, transformMeta } from "@monstermann/transform-meta"
import { createUnplugin } from "unplugin"

export default createUnplugin<MetaPluginOptions>(({
    enforce,
    exclude,
    getName,
    getPath,
    hmr,
    include,
} = {}) => {
    let isViteDevServer = false

    return {
        enforce,
        name: "unplugin-signals",
        transform: {
            filter: {
                id: {
                    exclude,
                    include: include || [/\.[jt]sx?$/],
                },
            },
            handler(code, id) {
                return transformMeta(code, id, {
                    getName,
                    getPath,
                    hmr: hmr ?? isViteDevServer,
                    resolve: setMetaParam({
                        action: 3,
                        deferEffect: 3,
                        effect: 3,
                        emitter: 2,
                        memo: 3,
                        reducer: 4,
                        signal: 3,
                        watch: 4,
                    }),
                })
            },
        },
        vite: {
            configResolved(config) {
                isViteDevServer = config.command === "serve"
            },
        },
    }
})
