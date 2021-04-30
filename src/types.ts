import { Atom } from "atom";
import { BehaviorSubject, Observable } from "rxjs";

export type ObservableState<T> = Observable<T> | BehaviorSubject<T> | Atom<T>;
