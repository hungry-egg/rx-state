import { combineLatest } from "rxjs";
import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from "rxjs/operators";
import { ReadonlyAtom } from "./atom";
import {
  ObservableLookup,
  ObservableTuple,
  UnwrapObservableLookup,
  UnwrapObservableTuple,
} from "./types";

function arrayToLookup(keys: string[], values: any[]) {
  const mem: { [key: string]: any; } = {};
  return keys.reduce((memo, key, i) => {
    memo[key] = values[i];
    return memo;
  }, mem);
}

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
): ReadonlyAtom<TMapperReturnValue>;

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
  return new ReadonlyAtom(
    stream$.pipe(publishReplay(1), refCount(), distinctUntilChanged())
  );
}
