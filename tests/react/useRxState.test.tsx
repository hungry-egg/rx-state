import { atom, WritableAtom } from "../../src/atom";
import { useRxState } from "../../src/react/useRxState";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import React from "react";
import { Subscription } from "rxjs";

describe("useRxState", () => {
  describe("subscribing to a subscribable", () => {
    let team$: WritableAtom<string>, Team: () => JSX.Element;

    beforeEach(() => {
      team$ = atom("Villa");
      Team = () => {
        const team = useRxState(team$);
        return <div data-testid="team">{team}</div>;
      };
    });

    it("auto-subscribes to a subscribable", () => {
      const { getByTestId } = render(<Team />);

      expect(getByTestId("team")).toContainHTML("Villa");

      act(() => team$.set("Wolves"));
      expect(getByTestId("team")).not.toContainHTML("Villa");
      expect(getByTestId("team")).toContainHTML("Wolves");
    });

    it("cleans up", () => {
      const unsubscribe = jest.fn() as Subscription["unsubscribe"];
      const subscribe = jest
        .spyOn(team$, "subscribe")
        .mockImplementation((callback) => ({ unsubscribe } as Subscription));
      const { unmount } = render(<Team />);
      expect(subscribe).toHaveBeenCalled();
      expect(unsubscribe).not.toHaveBeenCalled();
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  it("allows giving a tuple", () => {
    const team1$ = atom("Spurs"),
      score1$ = atom(0),
      team2$ = atom("Arsenal"),
      score2$ = atom(0),
      Team = () => {
        const [team1, score1, team2, score2] = useRxState([
          team1$,
          score1$,
          team2$,
          score2$,
        ]);
        return (
          <div data-testid="score">
            {team1} {score1} - {team2} {score2}
          </div>
        );
      },
      { getByTestId } = render(<Team />);

    expect(getByTestId("score")).toContainHTML("Spurs 0 - Arsenal 0");

    act(() => score1$.update((s) => s + 1));
    expect(getByTestId("score")).toContainHTML("Spurs 1 - Arsenal 0");
  });

  it("allows giving a lookup", () => {
    const name$ = atom("Sam"),
      age$ = atom(11),
      Team = () => {
        const { name, age } = useRxState({
          name: name$,
          age: age$,
        });
        return (
          <div data-testid="person">
            {name} is {age} years old.
          </div>
        );
      },
      { getByTestId } = render(<Team />);

    expect(getByTestId("person")).toContainHTML("Sam is 11 years old.");

    act(() => age$.update((a) => a + 1));
    expect(getByTestId("person")).toContainHTML("Sam is 12 years old.");
  });

  it("allows giving a function for evaluation once", () => {
    const name$ = atom("Gungedin"),
      fn = jest.fn(() => name$),
      Team = () => {
        const name = useRxState(fn);
        return <div data-testid="name">My name is {name}.</div>;
      },
      { getByTestId } = render(<Team />);

    expect(getByTestId("name")).toContainHTML("My name is Gungedin");

    act(() => name$.set("Lardie"));
    expect(getByTestId("name")).toContainHTML("My name is Lardie.");

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
