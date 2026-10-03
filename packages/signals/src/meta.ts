/** What `@monstermann/signals-transform` passes as the last argument. */
export interface Meta {
    readonly hmr?: Set<() => void>
    readonly line: number
    readonly name: string
    readonly path: string
}
