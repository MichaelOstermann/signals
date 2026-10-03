const observers = new WeakMap<Element, Set<(rect: DOMRectReadOnly) => void>>()

// Created when first needed, so the library can be imported where there is no DOM.
let ro: ResizeObserver | undefined

function onResizeEntries(entries: ResizeObserverEntry[]): void {
    for (const entry of entries) {
        const callbacks = observers.get(entry.target) ?? []
        for (const cb of callbacks) cb(entry.contentRect)
    }
}

export function observeDimensions(
    element: HTMLElement,
    onResize: (rect: DOMRectReadOnly) => void,
): () => void {
    const observer = ro ??= new ResizeObserver(onResizeEntries)
    const callbacks = observers.get(element) ?? new Set()
    callbacks.add(onResize)
    observers.set(element, callbacks)
    observer.observe(element)
    return () => {
        const callbacks = observers.get(element)
        callbacks?.delete(onResize)
        if (callbacks && callbacks.size > 0) return
        observer.unobserve(element)
    }
}
