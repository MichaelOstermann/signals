# peekOr

```ts
function peekOr(
    target: MaybeReactive<T> | undefined,
    fallback: MaybeReactive<T>,
): T;
```

Similar to [`peek`](./peek), but peeks from `fallback` when `target` is `undefined`.
