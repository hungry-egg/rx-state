import { BehaviorSubject, Observable, observable } from "rxjs";
import { map } from "rxjs/operators";
import { get } from "./get";

export class ReadonlyAtom<T> {
  [observable]() {
    return this.source;
  }

  private source: Observable<T>;

  constructor(source: Observable<T>) {
    this.source = source;
  }

  get() {
    return get(this.source);
  }

  map<TMapperReturnValue>(mapper: (value: T) => TMapperReturnValue) {
    return this.pipe(map(mapper));
  }

  // @ts-ignore - TODO: fix this
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

  private source: BehaviorSubject<T>;

  constructor(source: BehaviorSubject<T>) {
    this.source = source;
  }

  get() {
    return this.source.getValue();
  }

  set(value: T) {
    this.source.next(value);
  }

  update(updater: (value: T) => T) {
    this.set(updater(this.get()));
  }

  map<TMapperReturnValue>(mapper: (value: T) => TMapperReturnValue) {
    return this.pipe(map(mapper));
  }

  // @ts-ignore - TODO: fix this
  pipe: Observable<T>["pipe"] = (...args: any[]) => {
    // @ts-ignore
    return this.source.pipe(...args);
  };

  subscribe(callback: (value: T) => void) {
    return this.source.subscribe(callback);
  }

  destroy() {
    this.source.complete();
  }

  readonly() { return new ReadonlyAtom<T>(this.source.asObservable()); }
}

export type Atom<T> = WritableAtom<T> | ReadonlyAtom<T>;

export function atom<T>(value: T) {
  return new WritableAtom<T>(new BehaviorSubject<T>(value));
}
