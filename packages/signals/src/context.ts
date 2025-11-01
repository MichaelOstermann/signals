export interface Context<T> {
    (): T | undefined
    (context: T | undefined): T | undefined
}

export function context<T>(): Context<T> {
    let current: T | undefined
    return function (...args: [] | [context: T | undefined]) {
        if (!args.length) return current
        const prev = current
        current = args[0]
        return prev
    }
}
