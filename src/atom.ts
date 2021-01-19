import { BehaviorSubject } from "rxjs";

export class Atom<T> extends BehaviorSubject<T> {
  get = this.getValue;

  set = this.next;

  update(updater: (value: T) => T) {
    this.next(updater(this.getValue()));
  }
}

export function atom<T>(value: T) {
  return new Atom<T>(value);
}
