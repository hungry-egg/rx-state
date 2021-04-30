import { atom } from "./atom";
import { isAtom } from "./isAtom";
import { of } from "rxjs";

describe("isAtom", () => {
  it("returns true for atoms", () => {
    expect(isAtom(atom(7))).toBe(true);
    expect(isAtom(atom(7).readonly())).toBe(true);
  });

  it("returns false for anything else", () => {
    expect(isAtom(7)).toBe(false);
    expect(isAtom("7")).toBe(false);
    expect(isAtom(of("7"))).toBe(false);
  });
});
