import type { MetaOptions } from "@monstermann/meta"
import type { SourceMap } from "magic-string"
import remapping from "@jridgewell/remapping"
import { transform as transformMeta } from "@monstermann/meta"
import { SourceMap as MagicSourceMap } from "magic-string"
import { transformReact } from "./react"

export interface SignalsOptions extends Omit<MetaOptions, "params"> {
    /**
     * Whether to wrap reads of signals in React components and hooks with `useSignal` from `@monstermann/signals-react`.
     * Signals are recognized by their `$` prefix: `$count()`, `state.$count()`.
     * @default false
     */
    react?: boolean
}

export interface SignalsResult {
    code: string
    map: SourceMap
}

const module = "@monstermann/signals"

const params: MetaOptions["params"] = [
    { function: "action", module, position: 2 },
    { function: "deferEffect", module, position: 2 },
    { function: "effect", module, position: 2 },
    { function: "emitter", module, position: 1 },
    { function: "watch", module, position: 4 },
]

const actions = params.slice(0, 1)

/**
 * - Passes the name, path and line of where they have been created to actions.
 * - With `hmr`, passes what is needed to dispose effects, watchers and emitters when their module is replaced.
 * - With `react`, wraps reads of signals in components and hooks with `useSignal`.
 *
 * Returns `undefined` when nothing changed.
 */
export function transform(code: string, id: string, { react, ...options }: SignalsOptions = {}): SignalsResult | undefined {
    const maps: SourceMap[] = []

    // Nothing to do when the package is not mentioned, skip parsing.
    if (code.includes(module)) {
        const meta = transformMeta(code, id, { ...options, params: options.hmr ? params : actions })
        if (meta) {
            code = meta.code
            maps.push(meta.map)
        }
    }

    if (react) {
        const ms = transformReact(code, id)
        if (ms) {
            code = ms.toString()
            maps.push(ms.generateMap({ hires: "boundary", includeContent: true, source: id.split("?", 1)[0]! }))
        }
    }

    if (!maps.length) return

    return {
        code,
        get map() {
            if (maps.length === 1) return maps[0]!
            // Sourcemaps are combined in reverse order.
            return new MagicSourceMap(remapping(maps.toReversed() as never, () => null, { decodedMappings: true }) as never)
        },
    }
}
