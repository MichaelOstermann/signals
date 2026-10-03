export function findParentElement(
    element: HTMLElement | null,
    predicate: (element: HTMLElement) => boolean,
): HTMLElement | undefined {
    if (!element) return undefined
    if (predicate(element)) return element
    return findParentElement(element.parentElement, predicate)
}
