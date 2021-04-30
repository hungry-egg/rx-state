import { useState, useEffect, useMemo } from "react";
import { isObservable } from "rxjs";
import { combine } from "../combine";
import { isAtom } from "../isAtom";
import { get } from "../get";
import {
  StateObservable,
  ObservableLookup,
  ObservableTuple,
  UnwrapObservable,
  UnwrapObservableLookup,
  UnwrapObservableTuple,
} from "../types";

type State = StateObservable | ObservableTuple | ObservableLookup;

// Signature with single observable
export function useRxState<TState extends StateObservable>(
  state$: TState
): UnwrapObservable<TState>;

// Signature with lookup
export function useRxState<TState extends ObservableLookup>(
  stateLookup: TState
): UnwrapObservableLookup<TState>;

// Signature with tuple
export function useRxState<TState extends ObservableTuple>(
  stateTuple: TState
): UnwrapObservableTuple<TState>;

// Implementation
export function useRxState(state: State) {
  const state$ = useMemo(
    () =>
      isAtom(state) || isObservable(state)
        ? state
        : Array.isArray(state) // for typescript's sake
        ? combine(state)
        : combine(state),
    []
  );

  const [value, setValue] = useState(() => get(state$));

  useEffect(() => {
    const subscription = state$.subscribe((val) => setValue(val));
    return function cleanup() {
      subscription.unsubscribe();
    };
  }, []);

  return value;
}
