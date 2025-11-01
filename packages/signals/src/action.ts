import type { Disposer } from "./disposer"
import type { Meta, MetaOptions, UnpluginMeta } from "./meta"
import { emit } from "./internals/hooks"
import { isKind } from "./internals/isKind"
import { createMeta } from "./internals/meta"
import { register, registry, toList } from "./internals/registry"
import { defer, deferBatch, deferCleanups, deferUntrack, run } from "./internals/runner"
import { ACTION } from "./symbols"

export interface Action<T = any, U = any> {
    (...args: ([T] extends [never] ? [] : [payload: T])): U
    kind: ACTION
    meta: Meta
}

export interface ActionOptions extends MetaOptions {}

const actions = registry<Action>()
export const isAction = isKind<Action>(ACTION)
export const getActions = toList(actions)

export function action<T = never, U = void>(
    handler: (payload: T) => U,
    options?: ActionOptions,
    _meta?: UnpluginMeta,
): Action<T, U> {
    let cleanups: Disposer | undefined
    const meta = createMeta("Action", options, _meta)

    const action: Action<T, U> = (input?: any) => run(() => {
        let output: U
        deferBatch()
        deferUntrack()
        if (!meta.silent) {
            emit({ action: action as Action, input, name: "ACTION_START" })
            defer(() => emit({ action: action as Action, name: "ACTION_END", output }))
        }
        cleanups = deferCleanups(cleanups)
        output = handler(input)
        return output
    })

    action.kind = ACTION
    action.meta = meta
    register(actions, action)

    return action
}
