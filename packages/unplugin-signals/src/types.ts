import type { TransformMetaOptions } from "@monstermann/transform-meta"
import type { FilterPattern } from "unplugin"

export interface MetaPluginOptions extends Omit<TransformMetaOptions, "resolve"> {
    enforce?: "post" | "pre" | undefined
    exclude?: FilterPattern
    include?: FilterPattern
}
