import { combineLatest, Observable } from "rxjs";
import { map, publishReplay, refCount } from "rxjs/operators";

export function query<TResult, T1, T2>(
  streams: [Observable<T1>, Observable<T2>],
  callback: (values: [T1, T2]) => TResult
) {
  return combineLatest(streams).pipe(
    map(callback),
    publishReplay(1),
    refCount()
  );
}
