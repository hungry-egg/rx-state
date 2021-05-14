import { useState, useEffect, useMemo } from "react";
import { isObservable } from "rxjs";
import { combine } from "../combine";
import { isAtom } from "../isAtom";
import { get } from "../get";
import {
  StatefulObservable,
  ObservableLookup,
  ObservableTuple,
  UnwrapObservable,
  UnwrapObservableLookup,
  UnwrapObservableTuple,
} from "../types";

type State = StatefulObservable | ObservableTuple | ObservableLookup;
type StateFunction = () => State;

// Signature with single observable
export function useRxState<TState extends StatefulObservable>(
  state$: TState | (() => TState)
): UnwrapObservable<TState>;

// Signature with lookup
export function useRxState<TState extends ObservableLookup>(
  stateLookup: TState | (() => TState)
): UnwrapObservableLookup<TState>;

// Signature with tuple
export function useRxState<TState extends ObservableTuple>(
  stateTuple: TState | (() => TState)
): UnwrapObservableTuple<TState>;

// Implementation
export function useRxState(arg: State | StateFunction) {
  const state$ = useMemo(() => {
    const state = typeof arg === "function" ? arg() : arg;
    return isAtom(state) || isObservable(state)
      ? state
      : Array.isArray(state) // for typescript's sake
      ? combine(state)
      : combine(state);
  }, []);

  const [value, setValue] = useState(() => get(state$));

  useEffect(() => {
    const subscription = state$.subscribe((val) => setValue(val));
    return function cleanup() {
      subscription.unsubscribe();
    };
  }, []);

  return value;
}
