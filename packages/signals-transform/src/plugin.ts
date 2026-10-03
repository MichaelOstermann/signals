import type { SignalsOptions } from "./transform"
import { transform } from "./transform"

export interface SignalsPluginOptions extends SignalsOptions {
    enforce?: "post" | "pre"
    /** Skip files whose path matches one of these. */
    exclude?: RegExp | RegExp[]
    /**
     * Whether to dispose effects, watchers and emitters when their module is replaced.
     * @default true when used with the dev server of Vite
     */
    hmr?: boolean
    /**
     * Only transform files whose path matches one of these.
     * @default /\.[jt]sx?$/
     */
    include?: RegExp | RegExp[]
}

export interface SignalsPlugin {
    enforce?: "post" | "pre"
    name: string
    transform: {
        filter: { id: { exclude: RegExp[], include: RegExp[] } }
        handler: (code: string, id: string) => ReturnType<typeof transform>
    }
    configResolved: (config: { command: string }) => void
}

/** A plugin for Vite, Rolldown and tsdown. */
export function signals({ enforce, exclude = [], hmr, include = /\.[jt]sx?$/, ...options }: SignalsPluginOptions = {}): SignalsPlugin {
    let isViteDevServer = false

    const id = {
        exclude: [exclude].flat(),
        include: [include].flat(),
    }

    return {
        enforce,
        name: "signals",
        transform: {
            filter: { id },
            handler(code, path) {
                // Bundlers that do not know hook filters call the handler for every file.
                if (id.exclude.some(pattern => pattern.test(path))) return
                if (!id.include.some(pattern => pattern.test(path))) return
                return transform(code, path, { ...options, hmr: hmr ?? isViteDevServer })
            },
        },
        configResolved(config) {
            isViteDevServer = config.command === "serve"
        },
    }
}
