import { BehaviorSubject, Observable, observable } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";
import { get } from "./get";

export class ReadonlyAtom<T> {
  [observable]() {
    return this.source;
  }

  private source: Observable<T>;

  constructor(source: Observable<T>) {
    this.source = source.pipe(distinctUntilChanged());
  }

  get() {
    return get(this.source);
  }

  map<TMapperReturnValue>(mapper: (value: T) => TMapperReturnValue) {
    return new ReadonlyAtom<TMapperReturnValue>(this.pipe(map(mapper)));
  }

  // @ts-ignore - haven't been able to work with args spread and pipe overloads yet
  pipe: Observable<T>["pipe"] = (...args: any[]) => {
    // @ts-ignore
    return this.source.pipe(...args);
  };

  subscribe(callback: (value: T) => void) {
    return this.source.subscribe(callback);
  }
}

export class WritableAtom<T> {
  [observable]() {
    return this.source;
  }

  private bs: BehaviorSubject<T>;
  private source: Observable<T>;

  constructor(bs: BehaviorSubject<T>) {
    this.bs = bs;
    this.source = bs.pipe(distinctUntilChanged());
  }

  get() {
    return this.bs.getValue();
  }

  set(value: T) {
    this.bs.next(value);
  }

  update(updater: (value: T) => T) {
    this.set(updater(this.get()));
  }

  map<TMapperReturnValue>(mapper: (value: T) => TMapperReturnValue) {
    return new ReadonlyAtom<TMapperReturnValue>(this.pipe(map(mapper)));
  }

  // @ts-ignore - haven't been able to work with args spread and pipe overloads yet
  pipe: Observable<T>["pipe"] = (...args: any[]) => {
    // @ts-ignore
    return this.source.pipe(...args);
  };

  subscribe(callback: (value: T) => void) {
    return this.source.subscribe(callback);
  }

  readonly() {
    return new ReadonlyAtom<T>(this.source);
  }
}

export type Atom<T> = WritableAtom<T> | ReadonlyAtom<T>;

export function atom<T>(value: T) {
  return new WritableAtom<T>(new BehaviorSubject<T>(value));
}

export function readonlyAtom<T>(
  value: T
): [ReadonlyAtom<T>, (value: T) => void] {
  const atm = atom(value);
  return [atm.readonly(), atm.set.bind(atm)];
}
