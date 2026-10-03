import type { Dispose } from "./disposer"

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

type BatchSnapshot = {
    next: BatchSnapshot | undefined
    source: RawSignal
    value: unknown
    version: number
}

// Takes the place of the previous value for writes that keep the value, which can not be reverted.
const UNKNOWN = {}

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
let batchSnapshots: BatchSnapshot | undefined

// What is currently collecting dependencies, and what did so before it.
let evalContext: RawEffect | RawMemo | undefined
let evalDepth = 0
const evalStack: (RawEffect | RawMemo | undefined)[] = []

function pushContext(context: RawEffect | RawMemo | undefined): void {
    evalStack[evalDepth++] = evalContext
    evalContext = context
}

function popContext(): void {
    evalContext = evalStack[--evalDepth]
    evalStack[evalDepth] = undefined
}

function addDependency(signal: RawSignal): ReactiveNode | undefined {
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

function recordBatchSnapshot(source: RawSignal, value: unknown): void {
    // Only capture writes of the batch itself, not the ones effects do while it is flushed.
    if (batchDepth === 0 || batchIteration !== 0) return
    // The value of a mutable signal can be the same and still have changed.
    if (source.mutable) return

    if (source.snapshot !== undefined) {
        if (source.value === value) source.snapshot.value = UNKNOWN
        return
    }

    batchSnapshots = source.snapshot = {
        next: batchSnapshots,
        source,
        value: source.value === value ? UNKNOWN : source.value,
        version: source.version,
    }
}

function reconcileBatchSnapshots(): void {
    let snapshot = batchSnapshots
    batchSnapshots = undefined

    while (snapshot !== undefined) {
        const source = snapshot.source
        source.snapshot = undefined
        // The value is back to what it was before the batch: Fast-forward the targets
        // that have seen that value, so they do not consider the signal to have changed.
        // Versions are never rolled back, something may have seen the ones in between.
        if (source.value === snapshot.value) {
            for (
                let node = source.targets;
                node !== undefined;
                node = node.nextTarget
            ) {
                if (node.version === snapshot.version) {
                    node.version = source.version
                }
            }
        }
        snapshot = snapshot.next
    }
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
    mutable: boolean
    node: ReactiveNode | undefined
    onRead?: () => void
    onUnwatch?: () => void
    onWatch?: () => Dispose | void
    snapshot: BatchSnapshot | undefined
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
    mutable?: boolean
    onRead?: () => void
    onWatch?: () => Dispose | void
}

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-redeclare
export function RawSignal(this: RawSignal, value?: unknown, options?: RawSignalOptions) {
    this.node = undefined
    this.targets = undefined
    this.snapshot = undefined
    this.mutable = options?.mutable === true
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

    recordBatchSnapshot(this, value)
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

    prepareSources(this)
    pushContext(this)
    try {
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
        popContext()
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
    pushContext(this)
}

RawEffect.prototype.end = function (this: RawEffect) {
    if (evalContext !== this) {
        throw new Error("Out-of-order effect")
    }
    cleanupSources(this)
    popContext()

    this.flags &= ~RUNNING
    if (this.flags & DISPOSED) disposeEffect(this)
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
    // While running, the sources are being collected, `end` takes care of it.
    if (!(this.flags & RUNNING)) disposeEffect(this)
}

function disposeEffect(effect: RawEffect): void {
    for (
        let node = effect.sources;
        node !== undefined;
        node = node.nextSource
    ) {
        node.source.unsubscribe(node)
    }
    effect.fn = undefined
    effect.sources = undefined
}

/**
 * # isBatching
 *
 * ```ts
 * function isBatching(): boolean;
 * ```
 *
 * Whether updates are currently being batched.
 *
 * ## Example
 *
 * ```ts
 * import { batch, isBatching } from "@monstermann/signals";
 *
 * isBatching(); // false
 *
 * batch(() => {
 *     isBatching(); // true
 * });
 * ```
 */
export function isBatching(): boolean {
    return batchDepth > 0
}

/**
 * # startBatch
 *
 * ```ts
 * function startBatch(): void;
 * ```
 *
 * Similar to `batch`, but allows you to manually control when batching is done, see `endBatch`.
 *
 * ## Example
 *
 * ```ts
 * import { signal, effect, startBatch, endBatch } from "@monstermann/signals";
 *
 * const a = signal(0);
 * const b = signal(0);
 *
 * effect(() => console.log(a(), b()));
 *
 * startBatch();
 * try {
 *     a(1);
 *     b(1);
 * } finally {
 *     // Prints: 1, 1
 *     endBatch();
 * }
 * ```
 */
export function startBatch(): void {
    batchDepth++
}

/**
 * # endBatch
 *
 * ```ts
 * function endBatch(): void;
 * ```
 *
 * Ends a batch that has been started with `startBatch`, the outermost one runs the pending effects.
 *
 * ## Example
 *
 * ```ts
 * import { startBatch, endBatch } from "@monstermann/signals";
 *
 * startBatch();
 * try {
 *     // …
 * } finally {
 *     endBatch();
 * }
 * ```
 */
export function endBatch(): void {
    if (batchDepth > 1) {
        batchDepth--
        return
    }

    let error: unknown
    let hasError = false
    reconcileBatchSnapshots()

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

    if (hasError) {
        throw error
    }
}

/**
 * # untrack
 *
 * ```ts
 * function untrack<T>(fn: () => T): T;
 * ```
 *
 * Skips creating subscriptions for the duration of the provided callback.
 *
 * ## Example
 *
 * ```ts
 * import { signal, effect, untrack } from "@monstermann/signals";
 *
 * const a = signal(0);
 * const b = signal(0);
 *
 * effect(() => {
 *     console.log(a());
 *     untrack(() => console.log(b()));
 * });
 *
 * // Prints: 1, 0
 * a(1);
 *
 * // No effect:
 * b(1);
 * ```
 */
export function untrack<T>(fn: () => T): T {
    if (evalContext === undefined) return fn()
    pauseTracking()

    try { return fn() }
    finally { resumeTracking() }
}

/**
 * # pauseTracking
 *
 * ```ts
 * function pauseTracking(): void;
 * ```
 *
 * Similar to `untrack`, but allows you to manually control when tracking should be resumed, see `resumeTracking`.
 *
 * ## Example
 *
 * ```ts
 * import { signal, effect, pauseTracking, resumeTracking } from "@monstermann/signals";
 *
 * const a = signal(0);
 * const b = signal(0);
 *
 * effect(() => {
 *     console.log(a());
 *     pauseTracking();
 *     try {
 *         console.log(b());
 *     } finally {
 *         resumeTracking();
 *     }
 * });
 *
 * // Prints: 1, 0
 * a(1);
 *
 * // No effect:
 * b(1);
 * ```
 */
export function pauseTracking(): void {
    pushContext(undefined)
}

/**
 * # resumeTracking
 *
 * ```ts
 * function resumeTracking(): void;
 * ```
 *
 * Resumes tracking that has been paused with `pauseTracking`.
 *
 * ## Example
 *
 * ```ts
 * import { pauseTracking, resumeTracking } from "@monstermann/signals";
 *
 * pauseTracking();
 * try {
 *     // …
 * } finally {
 *     resumeTracking();
 * }
 * ```
 */
export function resumeTracking(): void {
    if (evalDepth > 0) popContext()
}
