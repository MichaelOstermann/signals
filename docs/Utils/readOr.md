# readOr

```ts
function readOr(
    target: MaybeReactive<T> | undefined,
    fallback: MaybeReactive<T>,
): T;
```

Similar to [`read`](./read), but reads from `fallback` when `target` is `undefined`.
