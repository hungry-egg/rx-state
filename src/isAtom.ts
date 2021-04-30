import { Atom, ReadonlyAtom, WritableAtom } from "./atom";

export const isAtom = (thing: any): thing is Atom<unknown> => {
  return (
    thing.constructor === ReadonlyAtom || thing.constructor === WritableAtom
  );
};
