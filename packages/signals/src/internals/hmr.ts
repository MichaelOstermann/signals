import type { DisposerMixin } from "../disposer"
import type { Meta } from "../meta"
import { dispose, onDispose } from "../disposer"

export function hmr(target: DisposerMixin, meta: Meta | undefined): void {
    const hmr = meta?.hmr
    if (!hmr) return
    const handler = () => dispose(target)
    hmr.add(handler)
    onDispose(target, () => hmr.delete(handler))
}
