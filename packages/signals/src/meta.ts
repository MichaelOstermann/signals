export interface UnpluginMeta {
    readonly hmr?: Set<() => void>
    readonly line: number
    readonly name: string
    readonly path: string
}

export type SignalKind =
    | "Action"
    | "Effect"
    | "Emitter"
    | "Memo"
    | "Reducer"
    | "Signal"
    | "Watcher"

export interface Meta extends UnpluginMeta {
    readonly debug: boolean
    readonly id: number
    readonly internal: boolean
    readonly kind: SignalKind
    readonly silent: boolean
}

export interface MetaOptions {
    debug?: boolean
    internal?: boolean
    name?: string
    silent?: boolean
}

export function stringifyMeta<T extends { meta: Meta } | Meta>(target: T): string {
    const meta = "meta" in target ? target.meta : target as Meta
    const suffix = meta.path && meta.line ? `:${meta.path}:${meta.line}` : ""
    return `${meta.kind}(${meta.name || "Anonymous"}${suffix})`
}
