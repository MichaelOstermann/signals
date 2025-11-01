import type { DllLink } from "@monstermann/dll"
import type { Dispose } from "./disposer"
import { Dll } from "@monstermann/dll"
import { emit } from "./internals/hooks"
import { untrack } from "./tracking"

type ReactiveNode = {
    nextSource: ReactiveNode | undefined
    nextTarget: ReactiveNode | undefined
    prevSource: ReactiveNode | undefined
    prevTarget: ReactiveNode | undefined
    rollbackNode: ReactiveNode | undefined
    source: RawSignal
    target: RawMemo | RawEffect
    version: number
}

const RUNNING = 1 << 0
const NOTIFIED = 1 << 1
const OUTDATED = 1 << 2
const DISPOSED = 1 << 3
const HAS_ERROR = 1 << 4
const TRACKING = 1 << 5

let batchDepth = 0
let batchedEffect: RawEffect | undefined
let batchIteration = 0
let version = 0
const sub: Dll<RawEffect | RawMemo | undefined> = Dll.create()

function addDependency(signal: RawSignal): ReactiveNode | undefined {
    const evalContext = sub.tail?.value

    if (evalContext === undefined) {
        return undefined
    }

    let node = signal.node
    if (node === undefined || node.target !== evalContext) {
        node = {
            nextSource: undefined,
            nextTarget: undefined,
            prevSource: evalContext.sources,
            prevTarget: undefined,
            rollbackNode: node,
            source: signal,
            target: evalContext,
            version: 0,
        }

        if (evalContext.sources !== undefined) {
            evalContext.sources.nextSource = node
        }
        evalContext.sources = node
        signal.node = node

        if (evalContext.flags & TRACKING) {
            signal.subscribe(node)
        }
        return node
    }
    else if (node.version === -1) {
        node.version = 0

        if (node.nextSource !== undefined) {
            node.nextSource.prevSource = node.prevSource

            if (node.prevSource !== undefined) {
                node.prevSource.nextSource = node.nextSource
            }

            node.prevSource = evalContext.sources
            node.nextSource = undefined

            evalContext.sources!.nextSource = node
            evalContext.sources = node
        }

        return node
    }
    return undefined
}

function cleanupSources(target: RawMemo | RawEffect) {
    let node = target.sources
    let head: ReactiveNode | undefined

    while (node !== undefined) {
        const prev = node.prevSource

        if (node.version === -1) {
            node.source.unsubscribe(node)

            if (prev !== undefined) {
                prev.nextSource = node.nextSource
            }
            if (node.nextSource !== undefined) {
                node.nextSource.prevSource = prev
            }
        }
        else {
            head = node
        }

        node.source.node = node.rollbackNode
        if (node.rollbackNode !== undefined) {
            node.rollbackNode = undefined
        }

        node = prev
    }

    target.sources = head
}

function needsToRecompute(target: RawMemo | RawEffect): boolean {
    for (
        let node = target.sources;
        node !== undefined;
        node = node.nextSource
    ) {
        if (
            node.source.version !== node.version
            || !node.source.refresh()
            || node.source.version !== node.version
        ) {
            return true
        }
    }
    return false
}

function prepareSources(target: RawMemo | RawEffect) {
    for (
        let node = target.sources;
        node !== undefined;
        node = node.nextSource
    ) {
        const rollbackNode = node.source.node
        if (rollbackNode !== undefined) {
            node.rollbackNode = rollbackNode
        }
        node.source.node = node
        node.version = -1

        if (node.nextSource === undefined) {
            target.sources = node
            break
        }
    }
}

// @ts-expect-error ignore
export declare class RawSignal<T = any> {
    node: ReactiveNode | undefined
    onRead?: () => void
    onUnwatch?: () => void
    onWatch?: () => Dispose | void
    targets: ReactiveNode | undefined
    value: T
    version: number

    constructor(value?: T, options?: RawSignalOptions)
    get(): T
    refresh(): boolean
    set(value: T): void
    subscribe(node: ReactiveNode): void
    unsubscribe(node: ReactiveNode): void
}

export interface RawSignalOptions {
    onRead?: () => void
    onWatch?: () => Dispose | void
}

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-redeclare
export function RawSignal(this: RawSignal, value?: unknown, options?: RawSignalOptions) {
    this.node = undefined
    this.targets = undefined
    this.value = value
    this.version = 0
    this.onRead = options?.onRead
    this.onWatch = options?.onWatch
    this.onUnwatch = undefined
}

RawSignal.prototype.refresh = function () {
    return true
}

RawSignal.prototype.subscribe = function (node: ReactiveNode) {
    const targets = this.targets
    if (targets !== node && node.prevTarget === undefined) {
        node.nextTarget = targets
        this.targets = node

        if (targets !== undefined) {
            targets.prevTarget = node
        }
        else if (this.onWatch) {
            this.onUnwatch = untrack(this.onWatch) as undefined
        }
    }
}

RawSignal.prototype.unsubscribe = function (node: ReactiveNode) {
    if (this.targets !== undefined) {
        const prev = node.prevTarget
        const next = node.nextTarget
        if (prev !== undefined) {
            prev.nextTarget = next
            node.prevTarget = undefined
        }

        if (next !== undefined) {
            next.prevTarget = prev
            node.nextTarget = undefined
        }

        if (node === this.targets) {
            this.targets = next
            if (next === undefined && this.onUnwatch) {
                this.onUnwatch = untrack(this.onUnwatch) as undefined
            }
        }
    }
}

RawSignal.prototype.get = function<T>(this: RawSignal<T>): T {
    if (this.onRead) untrack(this.onRead)
    const node = addDependency(this)
    if (node !== undefined) {
        node.version = this.version
    }
    return this.value
}

RawSignal.prototype.set = function<T>(this: RawSignal<T>, value: T): void {
    if (batchIteration > 100) {
        throw new Error("Cycle detected")
    }

    this.value = value
    this.version++
    version++

    startBatch()
    try {
        for (
            let node = this.targets;
            node !== undefined;
            node = node.nextTarget
        ) {
            node.target.notify()
        }
    }
    finally {
        endBatch()
    }
}

export declare class RawMemo<T = any> extends RawSignal<T> {
    flags: number
    fn: () => T
    globalVersion: number
    sources?: ReactiveNode

    constructor(fn: () => T, options?: RawMemoOptions)
    get(): T
    notify(): void
}

export interface RawMemoOptions {
    onWatch?: () => Dispose | void
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export function RawMemo(this: RawMemo, fn: () => unknown, options?: RawMemoOptions) {
    RawSignal.call(this, undefined, options)

    this.fn = fn
    this.sources = undefined
    this.globalVersion = version - 1
    this.flags = OUTDATED
}

RawMemo.prototype = new RawSignal() as RawMemo

RawMemo.prototype.refresh = function () {
    this.flags &= ~NOTIFIED

    if (this.flags & RUNNING) {
        return false
    }

    if ((this.flags & (OUTDATED | TRACKING)) === TRACKING) {
        return true
    }
    this.flags &= ~OUTDATED

    if (this.globalVersion === version) {
        return true
    }
    this.globalVersion = version

    this.flags |= RUNNING
    if (this.version > 0 && !needsToRecompute(this)) {
        this.flags &= ~RUNNING
        return true
    }

    let l: DllLink<RawMemo | RawEffect | undefined> | undefined
    try {
        prepareSources(this)
        l = Dll.append(sub, this)
        const value = this.fn()
        if (
            this.flags & HAS_ERROR
            || this.value !== value
            || this.version === 0
        ) {
            this.value = value
            this.flags &= ~HAS_ERROR
            this.version++
        }
    }
    catch (err) {
        this.value = err
        this.flags |= HAS_ERROR
        this.version++
    }
    finally {
        if (l) Dll.unlink(sub, l)
    }
    cleanupSources(this)
    this.flags &= ~RUNNING
    return true
}

RawMemo.prototype.subscribe = function (node) {
    if (this.targets === undefined) {
        this.flags |= OUTDATED | TRACKING

        for (
            let node = this.sources;
            node !== undefined;
            node = node.nextSource
        ) {
            node.source.subscribe(node)
        }
    }
    RawSignal.prototype.subscribe.call(this, node)
}

RawMemo.prototype.unsubscribe = function (node) {
    if (this.targets !== undefined) {
        RawSignal.prototype.unsubscribe.call(this, node)

        if (this.targets === undefined) {
            this.flags &= ~TRACKING

            for (
                let node = this.sources;
                node !== undefined;
                node = node.nextSource
            ) {
                node.source.unsubscribe(node)
            }
        }
    }
}

RawMemo.prototype.notify = function () {
    if (!(this.flags & NOTIFIED)) {
        this.flags |= OUTDATED | NOTIFIED

        for (
            let node = this.targets;
            node !== undefined;
            node = node.nextTarget
        ) {
            node.target.notify()
        }
    }
}

RawMemo.prototype.get = function<T>(this: RawMemo<T>): T {
    if (this.flags & RUNNING) {
        throw new Error("Cycle detected")
    }
    const node = addDependency(this)
    this.refresh()
    if (node !== undefined) {
        node.version = this.version
    }
    if (this.flags & HAS_ERROR) {
        throw this.value
    }
    return this.value
}

type EffectFn = () => void

// @ts-expect-error ignore
export declare class RawEffect {
    flags: number
    fn?: EffectFn
    nextBatchedEffect?: RawEffect
    sources?: ReactiveNode

    constructor(fn: EffectFn)
    dispose(): void
    end(): void
    notify(): void
    run(): void
    start(): void
}

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-redeclare
export function RawEffect(this: RawEffect, fn: EffectFn) {
    this.fn = fn
    this.sources = undefined
    this.nextBatchedEffect = undefined
    this.flags = TRACKING
}

RawEffect.prototype.notify = function () {
    if (!(this.flags & NOTIFIED)) {
        this.flags |= NOTIFIED
        this.nextBatchedEffect = batchedEffect
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        batchedEffect = this
    }
}

RawEffect.prototype.start = function (this: RawEffect): void {
    if (this.flags & RUNNING) {
        throw new Error("Cycle detected")
    }
    this.flags |= RUNNING
    this.flags &= ~DISPOSED
    prepareSources(this)

    startBatch()
    Dll.append(sub, this)
}

RawEffect.prototype.end = function (this: RawEffect) {
    if (sub.tail?.value !== this) {
        throw new Error("Out-of-order effect")
    }
    cleanupSources(this)
    Dll.unlink(sub, sub.tail!)

    this.flags &= ~RUNNING
    endBatch()
}

RawEffect.prototype.run = function (this: RawEffect): void {
    this.start()
    try {
        if (this.flags & DISPOSED) return
        if (this.fn === undefined) return
        this.fn()
    }
    finally {
        this.end()
    }
}

RawEffect.prototype.dispose = function (this: RawEffect): void {
    this.flags |= DISPOSED

    for (
        let node = this.sources;
        node !== undefined;
        node = node.nextSource
    ) {
        node.source.unsubscribe(node)
    }
    this.fn = undefined
    this.sources = undefined
}

const batchStart = { name: "BATCH_START" } as const
const batchEnd = { name: "BATCH_END" } as const

export function isBatching(): boolean {
    return batchDepth > 0
}

export function startBatch(): void {
    batchDepth++
    if (batchDepth === 1) emit(batchStart)
}

export function endBatch(): void {
    if (batchDepth > 1) {
        batchDepth--
        return
    }

    let error: unknown
    let hasError = false

    while (batchedEffect !== undefined) {
        let effect: RawEffect | undefined = batchedEffect
        batchedEffect = undefined

        batchIteration++

        while (effect !== undefined) {
            const next: RawEffect | undefined = effect.nextBatchedEffect
            effect.nextBatchedEffect = undefined
            effect.flags &= ~NOTIFIED

            if (!(effect.flags & DISPOSED) && needsToRecompute(effect)) {
                try {
                    effect.run()
                }
                catch (err) {
                    if (!hasError) {
                        error = err
                        hasError = true
                    }
                }
            }
            effect = next
        }
    }
    batchIteration = 0
    batchDepth--

    emit(batchEnd)

    if (hasError) {
        throw error
    }
}

export function isTracking(): boolean {
    return sub.tail !== undefined
}

export function pauseTracking(): void {
    Dll.append(sub, undefined)
}

export function resumeTracking(): void {
    if (sub.tail) Dll.unlink(sub, sub.tail)
}
