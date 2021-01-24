import { combineLatest, Observable, ObservedValueOf } from "rxjs";
import { map, publishReplay, refCount } from "rxjs/operators";

function arrayToLookup(keys: string[], values: any[]) {
  const mem: { [key: string]: any } = {};
  return keys.reduce((memo, key, i) => {
    memo[key] = values[i];
    return memo;
  }, mem);
}

type ObservableLookup = { [name: string]: Observable<unknown> };
// Can't seem to find a way to use Observable<unknown>[] or [...Observable<unknown>[]]
//   in a way that doesn't lose type information.
// For example, when unwrapping [Observable<boolean>, Observable<string>],
//   we want [boolean, string], NOT (boolean | string)[]
// This seems the only way to keep that type information, so for now,
//   just allow up to 8 in the tuple.
type ObservableTuple =
  | [Observable<unknown>]
  | [Observable<unknown>, Observable<unknown>]
  | [Observable<unknown>, Observable<unknown>, Observable<unknown>]
  | [
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>
    ]
  | [
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>
    ]
  | [
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>
    ]
  | [
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>
    ]
  | [
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>,
      Observable<unknown>
    ];

// { a: Observable<number>, b: Observable<string> } ----> { a: number, b: string }
type UnwrapObservableLookup<
  TObservableLookup extends ObservableLookup | ObservableTuple
> = {
  [Key in keyof TObservableLookup]: ObservedValueOf<TObservableLookup[Key]>;
};

// [ Observable<number>, Observable<string> ] ----> [ number, string ]
type UnwrapObservableTuple<TObservables extends ObservableTuple> = {
  [Index in keyof TObservables]: TObservables[Index] extends Observable<
    infer TValue
  >
    ? TValue
    : never;
};

// Signature with lookup
export function combine<TObservableLookup extends ObservableLookup>(
  observables: TObservableLookup
): Observable<UnwrapObservableLookup<TObservableLookup>>;

// Signature with lookup and mapper
export function combine<
  TObservableLookup extends ObservableLookup,
  TMapperReturnValue
>(
  observables: TObservableLookup,
  mapper: (
    valuesLookup: UnwrapObservableLookup<TObservableLookup>
  ) => TMapperReturnValue
): Observable<TMapperReturnValue>;

// Signature with array
export function combine<TObservables extends ObservableTuple>(
  observables: TObservables
): Observable<UnwrapObservableTuple<TObservables>>;

// Signature with array and mapper
export function combine<
  TObservables extends ObservableTuple,
  TMapperReturnValue
>(
  observables: TObservables,
  mapper: (values: UnwrapObservableTuple<TObservables>) => TMapperReturnValue
): Observable<UnwrapObservableTuple<TObservables>>;

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
  return stream$.pipe(publishReplay(1), refCount());
}
