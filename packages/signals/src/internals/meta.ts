import type { Meta, MetaOptions, SignalKind, UnpluginMeta } from "../meta"

let id = 0

export function createMeta(
    kind: SignalKind,
    options: MetaOptions | undefined,
    _meta: UnpluginMeta | undefined,
): Meta {
    const meta = {
        debug: options?.debug ?? false,
        hmr: _meta?.hmr,
        id: id++,
        internal: options?.internal ?? false,
        kind,
        line: _meta?.line ?? 0,
        name: options?.name || _meta?.name || "",
        path: _meta?.path || "",
        silent: options?.internal ?? options?.silent ?? false,
    }

    if (!meta.name && !meta.path) meta.internal = meta.silent = true
    return meta
}
