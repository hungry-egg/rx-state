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
type UnwrapObservables<TObservableLookup extends ObservableLookup> = {
  [Key in keyof TObservableLookup]: ObservedValueOf<TObservableLookup[Key]>;
};

export function combine<TObservableLookup extends ObservableLookup>(
  observables: TObservableLookup
) {
  const keys = Object.keys(observables);
  return combineLatest(...keys.map((k) => observables[k])).pipe(
    map(
      (values) =>
        arrayToLookup(keys, values) as UnwrapObservables<TObservableLookup>
    ),
    publishReplay(1),
    refCount()
  );
}
