/** What `@monstermann/signals-transform` passes as the last argument to effects, watchers and emitters during development. */
export interface Meta {
    /** Callbacks that are called and removed when the module is replaced. */
    readonly hmr?: Set<() => void>
}
