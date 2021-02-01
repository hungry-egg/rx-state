import { atom } from "../src/atom";
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

  describe("map", () => {
    it("allows mapping the value", () => {
      const counter$ = atom(3);
      const square$ = counter$.map((i) => i * i);
      expect(get(square$)).toEqual(9);
    });
  });

  describe("destroy", () => {
    it("stops sending to subscribers", () => {
      const counter$ = atom(3);
      const cb = jest.fn();
      counter$.subscribe(cb);

      counter$.set(7);
      expect(cb).toHaveBeenCalledWith(7);

      counter$.destroy();

      cb.mockClear();
      counter$.set(134);
      expect(cb).not.toHaveBeenCalled();
    });
  });
});
