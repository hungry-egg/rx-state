import { Atom, IS_ATOM } from "./atom";

export const isAtom = (thing: any): thing is Atom<unknown> => {
  return !!thing[IS_ATOM];
};
