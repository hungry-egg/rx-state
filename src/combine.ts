import { Atom, ReadonlyAtom } from "./atom";
import { combineLatest, Observable, ObservedValueOf } from "rxjs";
import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from "rxjs/operators";

function arrayToLookup(keys: string[], values: any[]) {
  const mem: { [key: string]: any; } = {};
  return keys.reduce((memo, key, i) => {
    memo[key] = values[i];
    return memo;
  }, mem);
}

type SyncObservable<T> = Observable<T> | Atom<T> | ReadonlyAtom<T>;

type ObservableLookup = { [name: string]: SyncObservable<any>; };
// Can't seem to find a way to use SyncObservable<any>[] or [...SyncObservable<any>[]]
//   in a way that doesn't lose type information.
// For example, when unwrapping [SyncObservable<boolean>, SyncObservable<string>],
//   we want [boolean, string], NOT (boolean | string)[]
// This seems the only way to keep that type information, so for now,
//   just allow up to 8 in the tuple.
type ObservableTuple =
  | [SyncObservable<any>]
  | [SyncObservable<any>, SyncObservable<any>]
  | [SyncObservable<any>, SyncObservable<any>, SyncObservable<any>]
  | [
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>
  ]
  | [
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>
  ]
  | [
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>
  ]
  | [
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>
  ]
  | [
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>,
    SyncObservable<any>
  ];

// SyncObservable<number> ----> number
type UnwrapObservable<Obs> = Obs extends Atom<infer T> ? T : ObservedValueOf<Obs>;

// { a: SyncObservable<number>, b: SyncObservable<string> } ----> { a: number, b: string }
type UnwrapObservableLookup<
  TObservableLookup extends ObservableLookup | ObservableTuple
  > = {
    [Key in keyof TObservableLookup]: UnwrapObservable<TObservableLookup[Key]>;
  };

// [ SyncObservable<number>, SyncObservable<string> ] ----> [ number, string ]
type UnwrapObservableTuple<TObservables extends ObservableTuple> = {
  [Index in keyof TObservables]: TObservables[Index] extends SyncObservable<
    infer TValue
  >
  ? TValue
  : never;
};

// Signature with lookup
export function combine<TObservableLookup extends ObservableLookup>(
  observables: TObservableLookup
): ReadonlyAtom<UnwrapObservableLookup<TObservableLookup>>;

// Signature with lookup and mapper
export function combine<
  TObservableLookup extends ObservableLookup,
  TMapperReturnValue
>(
  observables: TObservableLookup,
  mapper: (
    valuesLookup: UnwrapObservableLookup<TObservableLookup>
  ) => TMapperReturnValue
): ReadonlyAtom<TMapperReturnValue>;

// Signature with array
export function combine<TObservables extends ObservableTuple>(
  observables: TObservables
): ReadonlyAtom<UnwrapObservableTuple<TObservables>>;

// Signature with array and mapper
export function combine<
  TObservables extends ObservableTuple,
  TMapperReturnValue
>(
  observables: TObservables,
  mapper: (values: UnwrapObservableTuple<TObservables>) => TMapperReturnValue
): ReadonlyAtom<UnwrapObservableTuple<TObservables>>;

// Implementation
export function combine(
  observables: ObservableLookup | ObservableTuple,
  mapper?: Function
) {
  let stream$;
  if (Array.isArray(observables)) {
    stream$ = combineLatest(observables);
    if (mapper) {
      stream$ = stream$.pipe(map((values) => mapper(values)));
    }
  } else {
    const keys = Object.keys(observables);
    stream$ = combineLatest(keys.map((k) => observables[k])).pipe(
      map((values) => {
        const valuesLookup = arrayToLookup(keys, values);
        return mapper ? mapper(valuesLookup) : valuesLookup;
      })
    );
  }
  return new ReadonlyAtom(stream$.pipe(publishReplay(1), refCount(), distinctUntilChanged()));
}
