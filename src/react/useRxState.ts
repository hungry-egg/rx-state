import { useEffect, useState } from "react";
import { get } from "../get";
import { ObservableState } from "../types";

export const useRxState = <T>(state$: ObservableState<T>) => {
  const [value, setValue] = useState<T>(get(state$));

  useEffect(() => {
    const subscription = state$.subscribe((val) => setValue(val));
    return function cleanup() {
      subscription.unsubscribe();
    };
  });

  return value;
};
