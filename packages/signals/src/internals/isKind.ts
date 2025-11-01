export function isKind<T>(symbol: symbol): (value: unknown) => value is T {
    return function (value: unknown): value is T {
        return value != null
            && typeof value === "object"
            && "kind" in value
            && value.kind === symbol
    }
}
