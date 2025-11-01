# indexed

```ts
function indexed<T, K, V>(
    target: () => T[],
    by: (value: T) => [K, V],
    options?: MemoOptions<V>,
): MemoIndex<K, V>;
```

Creates a `memo` by indexing a list into a lazily maintained map `Map<K, WeakRef<V | undefined>>`.

This allows you to subscribe to individual entries from a list, instead of the entire thing.

## Example

```ts
const people = signal<Person[]>([{ id: 0, name: "John Doe" }]);

const peopleIdx = indexed(people, (person) => [person.id, person]);

peopleIdx(); // ReadonlyMap<number, Person>

peopleIdx.for(0); // Memo<Person | undefined>

peopleIdx.get(0); // Person | undefined
```
