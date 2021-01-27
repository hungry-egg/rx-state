import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

export class Atom<T> extends BehaviorSubject<T> {
  get = this.getValue;

  set = this.next;

  update(updater: (value: T) => T) {
    this.next(updater(this.getValue()));
  }

  map<TMapperReturnValue>(mapper: (value: T) => TMapperReturnValue) {
    return this.pipe(map(mapper));
  }
}

export function atom<T>(value: T) {
  return new Atom<T>(value);
}
