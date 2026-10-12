import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardLoading from "./loading";

// SCRUM-162 [S3-M2-TEST] — dashboard loading state
describe("DashboardLoading", () => {
  it("announces that the dashboard is loading", () => {
    render(<DashboardLoading />);
    expect(
      screen.getByRole("status", { name: "Loading your dashboard" }),
    ).toBeInTheDocument();
  });
});
