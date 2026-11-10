import {
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
} from "vitest";

import Home from "./page";

describe(
  "Landing page",
  () => {
    it(
      "shows the CareerLM heading and tagline",
      () => {
        render(
          <Home />
        );

        expect(
          screen.getByRole(
            "heading",
            {
              level: 1,
              name: "CareerLM",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /career guidance made easy/i
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "sends new users to registration",
      () => {
        render(
          <Home />
        );

        expect(
          screen.getByRole(
            "link",
            {
              name:
                "Start your journey!",
            }
          )
        ).toHaveAttribute(
          "href",
          "/register"
        );
      }
    );

    it(
      "provides a login path for returning users",
      () => {
        render(
          <Home />
        );

        expect(
          screen.getByRole(
            "link",
            {
              name: "Log in",
            }
          )
        ).toHaveAttribute(
          "href",
          "/login"
        );
      }
    );
  }
);