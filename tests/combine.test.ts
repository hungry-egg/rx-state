import { Observable } from "rxjs";
import { atom } from "../src/atom";
import { combine } from "../src/combine";
import { get } from "../src/get";

describe("combine", () => {
  let names$: Observable<string[]>, index$: Observable<number>;

  beforeEach(() => {
    names$ = atom(["Fred", "Joy", "Nelson"]);
    index$ = atom(1);
  });

  it("combines streams", () => {
    const stream$ = combine({ n: names$, i: index$ });
    expect(get(stream$)).toEqual({ n: ["Fred", "Joy", "Nelson"], i: 1 });
  });

  it("allows mapping", () => {
    const name$ = combine({ n: names$, i: index$ }, ({ i, n }) => n[i]);
    expect(get(name$)).toEqual("Joy");
  });

  it("allows using an array", () => {
    const stream$ = combine([names$, index$]);
    expect(get(stream$)).toEqual([["Fred", "Joy", "Nelson"], 1]);
  });

  it("allows using an array and mapping", () => {
    const name$ = combine([names$, index$], ([names, index]) => names[index]);
    expect(get(name$)).toEqual("Joy");
  });
});
