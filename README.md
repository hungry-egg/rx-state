# @rx-utils/state

State management utilities based on RxJS

This library provides a very thin wrapper around some RxJS objects that are useful for state management.

There are only two main components: `atom` and `combine`.

All functions are importable in the usual way:

```ts
import { atom } from "@rx-utils/state";
```

## `atom`

This is very simply a container for _any value that changes_. It's a thin wrapper around an RxJS `BehaviorSubject`.

Where you'd normally have a static value

```ts
const name = "Jerry";
```

you simply wrap with `atom`

```ts
const name$ = atom("Jerry");
```

The `$` at the end is a convention sometimes used to indicate an observable object.

Now you can subscribe to updates with a callback

```ts
const sub = name$.subscribe((name) => console.log(`Name is now ${name}`));
```

so that when it's changed the callback is called

```ts
const name$.set("Tom"); // Logs "Name is now Tom"
```

To avoid memory leaks you should unsubscribe when finished

```ts
sub.unsubscribe();
```

The `atom` function returns a `WritableAtom`, which has the following methods:

```ts
const $name = atom("Jerry");

$name.get()                            // "Jerry"
$name.set("Tom")                       // sets value to "Tom" and notifies subscribers
$name.update(n => n + " Mander")       // set to "Jerry Mander" -
                                       //   use instead of set if you want to use the previous value

const uppercaseName$ = $name.pipe(     // pipe can be used as per usual in RxJS,
  map(n => n.toUpperCase()),           // and returns an RxJS observable
  ...
)
const lowercaseName$ = $name.map(n => n.toLowerCase()) // "map" is provided for convenience so you
                                                       //   don't need pipe, and returns a ReadonlyAtom

const $nameRO = $name.readonly()       // returns a read-only version of the atom (ReadonlyAtom)
$nameRO.get()    // "Jerry Mander"
$nameRO.set(...) // ERROR - METHOD DOESN'T EXIST!

$name.destroy()                        // rarely used but can use to remove all subscribers
```

The `ReadonlyAtom` is similar but only has `get`, `map`, `pipe` and `subscribe`.

### `readonlyAtom`

This is a convenience method for creating a read-only atom, that also yields a setter function.

```ts
const [count$, setCount] = readonlyAtom(4);
count$.get(); // 4 - this is just a ReadonlyAtom

setCount(7);
count$.get(); // 7
```

This would be useful for e.g. using in a class, where the read-only atom is public, but the setter is private:

```ts
class Person {
  public name$: ReadonlyAtom<string>;
  private setName: (name: string) => void;

  constructor(initialName: string) {
    [this.name$, this.setName] = readonlyAtom(initialName); // NOTE the parentheses when doing this
  }

  //... use this.setName("...") internally
}

const person = new Person("Fred");
person.name$.set("Bubba"); // ERROR: name$ is readonly so has no 'set'
```

## `combine`

This combines RxJS observables or atoms in a way that is useful for efficiently using derived values.

If:

- the `atom` is analogous to a [Redux](https://redux.js.org/) store (or part of),

then

- `combine` is analogous to memoized selectors like [Reselect](https://github.com/reduxjs/reselect).

Given multiple atoms (or other synchronous RxJS observables)

```ts
const names$ = atom(["Geoffrey", "Bungle", "George", "Zippy"]);
const selectedIndex$ = atom(1);
```

Then you can combine them into a new observable with a tuple

```ts
const selectedName$ = combine(
  [names$, selectedIndex$], // tuple of multiple observables
  ([names, index]) => names[index] // calculate new value derived from values from observables
);
selectedName$.get(); // "Bungle"
```

or with an object

```ts
const selectedName$ = combine(
  { names: names$, idx: selectedIndex$ }, // object lookup of multiple observables
  ({ names, idx }) => names[idx] // calculate derived value
);
selectedName$.get(); // "Bungle"
```

The new observable is efficient in that

- it only makes the calculation (the 2nd argument function) once when any of its input observables have changed
- it doesn't make the calculation if no-one is subscribing

In both forms you can also call `combine` with no 2nd argument

```ts
const selectedName$ = combine({ names: names$, idx: selectedIndex$ }); // = an observable that emits {names: string[], idx: number} objects

const selectedName$ = combine([names$, selectedIndex$]); // = an observable that emits [string[], number] objects
```

## `get`

This library provides a convenience method for **synchronously** getting the value from an RxJS observable

```ts
get(count$); // 7
```

This only works in cases where it's able to give its current value synchronously either because

- it calls subscription callbacks synchronously, or
- it's a `BehaviorSubject`

Otherwise it will throw an error

```ts
const click$ = fromEvent(document, "click");
get(click$); // THROWS AN ERROR -
//   it doesn't make sense here as click$ is asynchronous
```

## Build

    yarn build

## Build on file change

    yarn watch

## Test

    yarn test
