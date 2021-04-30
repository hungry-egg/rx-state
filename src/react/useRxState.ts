import { useEffect, useState } from "react";
import { get } from "../get";
import { StateObservable } from "../types";

export const useRxState = <T>(state$: StateObservable<T>): T => {
  const [value, setValue] = useState<T>(get(state$));

  useEffect(() => {
    const subscription = state$.subscribe((val) => setValue(val));
    return function cleanup() {
      subscription.unsubscribe();
    };
  });

  return value as T;
};
