import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks =
  vi.hoisted(() => ({
    redirect:
      vi.fn(),
  }));

vi.mock(
  "next/navigation",
  () => ({
    redirect:
      mocks.redirect,
  })
);

import GeneratingPage from "./page";

describe(
  "GeneratingPage",
  () => {
    it(
      "redirects legacy generation visits to the persisted roadmap",
      () => {
        GeneratingPage();

        expect(
          mocks.redirect
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mocks.redirect
        ).toHaveBeenCalledWith(
          "/roadmap"
        );
      }
    );
  }
);