import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
  usePathname: () => "/dashboard",
}));

import DashboardError from "./error";

// SCRUM-162 [S3-M2-TEST] — dashboard error state
describe("DashboardError", () => {
  it("explains the failure and retries when asked", async () => {
    const reset = vi.fn();
    render(<DashboardError reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load your dashboard",
    );
    await userEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(refresh).toHaveBeenCalled();
    expect(reset).toHaveBeenCalled();
  });
});
