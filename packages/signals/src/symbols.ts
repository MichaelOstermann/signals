/* eslint-disable @typescript-eslint/no-redeclare */
export const ACTION = Symbol("Action")
export const DISPOSER = Symbol("Disposer")
export const EFFECT = Symbol("Effect")
export const EMITTER = Symbol("Emitter")
export const MEMO = Symbol("Memo")
export const REDUCER = Symbol("Reducer")
export const SIGNAL = Symbol("Signal")
export const WATCHER = Symbol("Watcher")

export type ACTION = typeof ACTION
export type DISPOSER = typeof DISPOSER
export type EFFECT = typeof EFFECT
export type EMITTER = typeof EMITTER
export type MEMO = typeof MEMO
export type REDUCER = typeof REDUCER
export type SIGNAL = typeof SIGNAL
export type WATCHER = typeof WATCHER
