import { BehaviorSubject, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { atom } from "../src/atom";
import { get } from "../src/get";

describe("get", () => {
  it("gets from a BehaviorSubject", () => {
    const bs = new BehaviorSubject(4);
    jest.spyOn(bs, "subscribe");
    expect(get(bs)).toEqual(4);
    expect(bs.subscribe).not.toHaveBeenCalled();
  });

  it("gets from an atom", () => {
    const num$ = atom(4);
    jest.spyOn(num$, "subscribe");
    expect(get(num$)).toEqual(4);
    expect(num$.subscribe).not.toHaveBeenCalled();
  });

  it("gets from a synchronous observable", () => {
    const obs$ = (new BehaviorSubject(4)).pipe(map(n => n.toString()));
    expect(get(obs$)).toEqual("4");
  });

  it("throws if the observable isn't synchronous", () => {
    const s = new Subject();
    expect(() => get(s)).toThrowError(`Cannot get value from a stream that doesn't call its subscriber synchronously`);
  });
});