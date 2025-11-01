import { isTracking, pauseTracking, resumeTracking } from "./system"

export function untrack<T>(fn: () => T): T {
    if (!isTracking()) return fn()
    pauseTracking()
    // eslint-disable-next-line @stylistic/max-statements-per-line
    try { return fn() }
    finally { resumeTracking() }
}
