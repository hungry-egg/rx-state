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

  it("allows giving a tuple", () => {});

  it("allows giving a lookup", () => {});
});
