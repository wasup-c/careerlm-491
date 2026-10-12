import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ProfileSection from "./ProfileSection";
import type { SaveProfile } from "@/lib/fixtures/mockProfileService";
import { completeProfile } from "@/lib/fixtures/dashboard";

// SCRUM-162 [S3-M2-TEST] — view/edit switching on the dashboard
describe("ProfileSection", () => {
  it("opens the editor and shows the saved profile afterward", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn<SaveProfile>(async (profile) => ({ ok: true, profile }));
    render(<ProfileSection initialProfile={completeProfile} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Edit profile" }));
    const role = screen.getByLabelText("Target role");
    await user.clear(role);
    await user.type(role, "UX Engineer");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("UX Engineer")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Profile saved.");
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();
  });

  it("returns to the original profile on cancel", async () => {
    const user = userEvent.setup();
    render(<ProfileSection initialProfile={completeProfile} onSave={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Edit profile" }));
    await user.type(screen.getByLabelText("Target role"), " Lead");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();
  });
});
