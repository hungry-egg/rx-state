import { BehaviorSubject, of } from "rxjs";
import { WritableAtom, atom, ReadonlyAtom } from "../src/atom";
import { combine } from "../src/combine";

describe("combine", () => {
  let names$: WritableAtom<string[]>, index$: WritableAtom<number>;

  beforeEach(() => {
    names$ = atom(["Fred", "Joy", "Nelson"]);
    index$ = atom(1);
  });

  it("combines streams", () => {
    const stream$: ReadonlyAtom<{ n: string[]; i: number }> = combine({
      n: names$,
      i: index$,
    });
    expect(stream$.get()).toEqual({ n: ["Fred", "Joy", "Nelson"], i: 1 });
  });

  it("works with a combination of atoms and other streams", () => {
    const stream$: ReadonlyAtom<{ t: number; i: number }> = combine({
      t: of(7),
      i: index$,
    });
    expect(stream$.get()).toEqual({ t: 7, i: 1 });
  });

  it("allows mapping", () => {
    const name$: ReadonlyAtom<string> = combine(
      { n: names$, i: index$ },
      ({ i, n }) => n[i]
    );
    expect(name$.get()).toEqual("Joy");
  });

  it("allows using an array", () => {
    const stream$: ReadonlyAtom<[string[], number]> = combine([names$, index$]);
    expect(stream$.get()).toEqual([["Fred", "Joy", "Nelson"], 1]);
  });

  it("allows using an array and mapping", () => {
    const name$: ReadonlyAtom<string> = combine(
      [names$, index$],
      ([names, index]) => names[index]
    );
    expect(name$.get()).toEqual("Joy");
  });

  it("only calculates once for multiple observers", () => {
    const mapper = jest.fn(([names, index]) => names[index]);
    const name$ = combine([names$, index$], mapper);

    let a, b;
    const sub1 = name$.subscribe((name) => (a = name));
    const sub2 = name$.subscribe((name) => (b = name));

    expect(a).toEqual("Joy");
    expect(b).toEqual("Joy");
    expect(mapper).toHaveBeenCalledTimes(1);

    mapper.mockClear();
    index$.set(0);
    expect(a).toEqual("Fred");
    expect(b).toEqual("Fred");
    expect(mapper).toHaveBeenCalledTimes(1);

    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it("doesn't bother calculating if no-one is observing", () => {
    const mapper = jest.fn(([names, index]) => names[index]);
    combine([names$, index$], mapper);

    index$.set(0);
    expect(mapper).toHaveBeenCalledTimes(0);
  });

  it("doesn't call subscription if it hasn't changed", () => {
    const i$ = new BehaviorSubject(1);
    const name$ = combine([names$, i$], ([names, i]) => names[i]);
    const cb = jest.fn();
    const sub = name$.subscribe(cb);
    cb.mockClear();

    i$.next(1);
    expect(cb).not.toHaveBeenCalled();

    sub.unsubscribe();
  });

  it("sanity check that only the current value gets shared", () => {
    const name$ = combine([names$, index$], ([names, i]) => names[i]);
    index$.set(0);
    index$.set(1);
    index$.set(2);

    const cb = jest.fn();
    const sub = name$.subscribe(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    sub.unsubscribe();
  });
});
