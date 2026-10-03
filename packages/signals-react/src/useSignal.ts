import type { Memo, ReadonlySignal, Reducer } from "@monstermann/signals"
import { pauseTracking, RawEffect, RawMemo, resumeTracking } from "@monstermann/signals"
import { useCallback, useMemo, useSyncExternalStore } from "react"

type UseSignalValue<T> =
    | ReadonlySignal<T>
    | Reducer<T>
    | Memo<T>
    | (() => T)

export function useSignal<T>(value: UseSignalValue<T>): T {
    const signal = useMemo(() => {
        if ("kind" in value) return value
        const memo = new RawMemo(value)
        return () => memo.get()
    }, [value])

    const subscribe = useCallback((cb: () => void) => {
        let isFirst = true
        const effect = new RawEffect(() => {
            signal()
            if (!isFirst) cb()
            isFirst = false
        })
        effect.run()
        return () => effect.dispose()
    }, [signal])

    const getSnapshot = useCallback(() => {
        pauseTracking()

        try { return signal() }
        finally { resumeTracking() }
    }, [signal])

    return useSyncExternalStore(subscribe, getSnapshot)
}
