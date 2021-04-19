import { map } from "rxjs/operators";
import { atom, readonlyAtom } from "../src/atom";
import { get } from "../src/get";

describe("atom", () => {
  it("updates subscribers with its value", () => {
    const counter$ = atom(4);
    const cb1 = jest.fn(),
      cb2 = jest.fn();
    const sub1 = counter$.subscribe(cb1);
    const sub2 = counter$.subscribe(cb2);
    counter$.set(7);
    expect(cb1).toHaveBeenCalledWith(7);
    expect(cb2).toHaveBeenCalledWith(7);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it("calls a subscription synchronously with its current value", () => {
    const counter$ = atom(4);
    const cb = jest.fn();
    const sub = counter$.subscribe(cb);
    expect(cb).toHaveBeenCalledWith(4);
    sub.unsubscribe();
  });

  it("only updates subscribers when actually changed (using ===)", () => {
    const counter$ = atom(4);
    const cb = jest.fn();
    const sub = counter$.subscribe(cb);
    cb.mockReset();
    counter$.set(4);
    expect(cb).not.toHaveBeenCalled();
    sub.unsubscribe();
  });

  describe("map", () => {
    it("allows mapping the value to another atom", () => {
      const counter$ = atom(3);
      const square$ = counter$.map((i) => i * i);
      expect(square$.get()).toEqual(9);
    });
  });

  describe("pipe", () => {
    it("allows piping", () => {
      const counter$ = atom(7);
      const square$ = counter$.pipe(
        map((i) => i * i),
        map((i) => i + 1),
      );
      expect(get(square$)).toEqual(50);
    });
  });

  describe("readonly", () => {
    it("returns a readonly version", () => {
      const counter$ = atom(4),
        readonlyCounter$ = counter$.readonly();

      expect('set' in readonlyCounter$).toBeFalsy();
      counter$.set(7);
      expect(readonlyCounter$.get()).toEqual(7);

      const cb = jest.fn(),
        sub = readonlyCounter$.subscribe(cb);
      expect(cb).toHaveBeenCalledWith(7);
      sub.unsubscribe();

    });

    it("creates a readonly version with readonlyAtom", () => {
      const [count$, setCount] = readonlyAtom(4);
      expect('set' in count$).toBeFalsy();
      setCount(7);
      expect(count$.get()).toEqual(7);
    });
  });
});
