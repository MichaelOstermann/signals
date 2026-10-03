import { transform } from "./transform"

export interface SignalsReactPluginOptions {
    enforce?: "post" | "pre"
    /** Skip files whose path matches one of these. */
    exclude?: RegExp | RegExp[]
    /**
     * Only transform files whose path matches one of these.
     * @default /\.[jt]sx?$/
     */
    include?: RegExp | RegExp[]
}

export interface SignalsReactPlugin {
    enforce?: "post" | "pre"
    name: string
    transform: {
        filter: { code: RegExp, id: { exclude: RegExp[], include: RegExp[] } }
        handler: (code: string, id: string) => ReturnType<typeof transform>
    }
}

/** A plugin for Vite, Rolldown and tsdown. */
export function signalsReact({ enforce, exclude = [], include = /\.[jt]sx?$/ }: SignalsReactPluginOptions = {}): SignalsReactPlugin {
    const id = {
        exclude: [exclude].flat(),
        include: [include].flat(),
    }

    return {
        enforce,
        name: "signals-react",
        transform: {
            filter: { code: /\$/, id },
            handler(code, path) {
                // Bundlers that do not know hook filters call the handler for every file.
                if (id.exclude.some(pattern => pattern.test(path))) return
                if (!id.include.some(pattern => pattern.test(path))) return
                return transform(code, path)
            },
        },
    }
}
