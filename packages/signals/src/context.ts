export interface Context<T> {
    (): T | undefined
    (context: T | undefined): T | undefined
}

/**
 * # context
 *
 * ```ts
 * function context<T>(): Context<T>;
 * ```
 *
 * Allows you to temporarily define global context, similar to React's `createContext` / `useContext`.
 *
 * ## Example
 *
 * ```ts
 * import { context } from "@monstermann/signals";
 *
 * // Create:
 * const ctx = context<string>();
 *
 * // Set:
 * const prevCtx = ctx("Hello World!");
 *
 * // Read:
 * ctx(); // "Hello World!"
 *
 * // Restore:
 * ctx(prevCtx);
 * ```
 */
export function context<T>(): Context<T> {
    let current: T | undefined
    return function (...args: [] | [context: T | undefined]) {
        if (!args.length) return current
        const prev = current
        current = args[0]
        return prev
    }
}
