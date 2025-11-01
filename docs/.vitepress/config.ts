import { defineConfig } from "vitepress"
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons"

export default defineConfig({
    base: "/signals/",
    description: "A signals library.",
    title: "signals",
    markdown: {
        theme: {
            dark: "catppuccin-macchiato",
            light: "github-light-default",
        },
        config(md) {
            md.use(groupIconMdPlugin)
        },
    },
    themeConfig: {
        aside: false,
        outline: "deep",
        docFooter: {
            next: false,
            prev: false,
        },
        search: {
            provider: "local",
        },
        sidebar: [
            { base: "/Signal/", text: "Signal", items: [
                { link: "signal", text: "signal" },
                { link: "isSignal", text: "isSignal" },
                { link: "getSignals", text: "getSignals" },
            ] },
            { base: "/Memo/", text: "Memo", items: [
                { link: "memo", text: "memo" },
                { link: "indexed", text: "indexed" },
                { link: "isMemo", text: "isMemo" },
                { link: "getMemos", text: "getMemos" },
            ] },
            { base: "/Effect/", text: "Effect", items: [
                { link: "effect", text: "effect" },
                { link: "deferEffect", text: "deferEffect" },
                { link: "isEffect", text: "isEffect" },
                { link: "hasEffect", text: "hasEffect" },
                { link: "currentEffect", text: "currentEffect" },
                { link: "disposeEffect", text: "disposeEffect" },
            ] },
            { base: "/Reducer/", text: "Reducer", items: [
                { link: "reducer", text: "reducer" },
                { link: "isReducer", text: "isReducer" },
                { link: "getReducers", text: "getReducers" },
            ] },
            { base: "/Emitter/", text: "Emitter", items: [
                { link: "emitter", text: "emitter" },
                { link: "isEmitter", text: "isEmitter" },
                { link: "getEmitters", text: "getEmitters" },
            ] },
            { base: "/Action/", text: "Action", items: [
                { link: "action", text: "action" },
                { link: "isAction", text: "isAction" },
                { link: "getActions", text: "getActions" },
            ] },
            { base: "/Watcher/", text: "Watcher", items: [
                { link: "watch", text: "watch" },
                { link: "isWatcher", text: "isWatcher" },
                { link: "hasWatcher", text: "hasWatcher" },
                { link: "currentWatcher", text: "currentWatcher" },
                { link: "disposeWatcher", text: "disposeWatcher" },
            ] },
            { base: "/Disposer/", text: "Disposer", items: [
                { link: "disposer", text: "disposer" },
                { link: "disposed", text: "disposed" },
                { link: "mixinDisposer", text: "mixinDisposer" },
                { link: "isDisposer", text: "isDisposer" },
                { link: "isDisposed", text: "isDisposed" },
                { link: "onDispose", text: "onDispose" },
                { link: "dispose", text: "dispose" },
            ] },
            { base: "/Batching/", text: "Batching", items: [
                { link: "batch", text: "batch" },
                { link: "isBatching", text: "isBatching" },
                { link: "startBatch", text: "startBatch" },
                { link: "endBatch", text: "endBatch" },
            ] },
            { base: "/Tracking/", text: "Tracking", items: [
                { link: "untrack", text: "untrack" },
                { link: "isTracking", text: "isTracking" },
                { link: "stopTracking", text: "stopTracking" },
                { link: "resumeTracking", text: "resumeTracking" },
            ] },
            { base: "/Debugging/", text: "Debugging", items: [
                { link: "onDevHook", text: "onDevHook" },
            ] },
            { base: "/Utils/", text: "Utils", items: [
                { link: "context", text: "context" },
                { link: "onCleanup", text: "onCleanup" },
                { link: "asReadonly", text: "asReadonly" },
                { link: "read", text: "read" },
                { link: "readOr", text: "readOr" },
                { link: "peek", text: "peek" },
                { link: "peekOr", text: "peekOr" },
                { link: "Reactive", text: "Reactive" },
                { link: "MaybeReactive", text: "MaybeReactive" },
                { link: "INTERNAL", text: "INTERNAL" },
                { link: "SILENT", text: "SILENT" },
            ] },
        ],
        socialLinks: [
            { icon: "github", link: "https://github.com/MichaelOstermann/signals" },
        ],
    },
    vite: {
        plugins: [
            groupIconVitePlugin(),
        ],
    },
})
