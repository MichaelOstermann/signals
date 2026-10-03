let users = 0
let x = 0
let y = 0

function onMouseMove(evt: MouseEvent): void {
    x = evt.clientX
    y = evt.clientY
}

/** Keeps track of the mouse for as long as something needs it, returns a function to stop. */
export function trackMousePosition(): () => void {
    let stopped = false
    if (users++ === 0) document.addEventListener("mousemove", onMouseMove, { passive: true })
    return () => {
        if (stopped) return
        stopped = true
        if (--users === 0) document.removeEventListener("mousemove", onMouseMove)
    }
}

export function getMousePosition(): { x: number, y: number } {
    return { x, y }
}
