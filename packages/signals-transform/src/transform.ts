import type { MetaOptions } from "@monstermann/meta"
import { transform as transformMeta } from "@monstermann/meta"

export interface SignalsOptions extends Omit<MetaOptions, "params"> {}

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
 * Passes the name, path and line of where they have been created to actions,
 * and with `hmr` what is needed to dispose effects, watchers and emitters
 * when their module is replaced.
 */
export function transform(code: string, id: string, options?: SignalsOptions): ReturnType<typeof transformMeta> {
    if (!code.includes(module)) return
    return transformMeta(code, id, { ...options, params: options?.hmr ? params : actions })
}
