import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ProfileEditForm from "./ProfileEditForm";
import type { SaveProfile } from "@/lib/fixtures/mockProfileService";
import { completeProfile } from "@/lib/fixtures/dashboard";

// SCRUM-162 [S3-M2-TEST] — profile edit form, controlled service responses
function setup(onSave: SaveProfile) {
  const onSaved = vi.fn();
  const onCancel = vi.fn();
  render(
    <ProfileEditForm
      initial={completeProfile}
      onSave={onSave}
      onSaved={onSaved}
      onCancel={onCancel}
    />,
  );
  return { onSaved, onCancel, user: userEvent.setup() };
}

describe("ProfileEditForm", () => {
  it("labels every field and starts with the current profile values", () => {
    setup(vi.fn());
    expect(screen.getByLabelText("Name")).toHaveValue("Alex Rivera");
    expect(screen.getByLabelText("Target role")).toHaveValue("Frontend Engineer");
    expect(screen.getByLabelText("Experience level")).toHaveValue("intermediate");
  });

  it("moves focus to the first field when the form opens", () => {
    setup(vi.fn());
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });

  it("sends the edited profile and reports success", async () => {
    const onSave = vi.fn<SaveProfile>(async (profile) => ({ ok: true, profile }));
    const { onSaved, user } = setup(onSave);

    const role = screen.getByLabelText("Target role");
    await user.clear(role);
    await user.type(role, "UX Engineer");
    await user.selectOptions(screen.getByLabelText("Experience level"), "advanced");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const expected = {
      name: "Alex Rivera",
      targetRole: "UX Engineer",
      experienceLevel: "advanced",
    };
    expect(onSave).toHaveBeenCalledWith(expected);
    expect(onSaved).toHaveBeenCalledWith(expected);
  });

  it("shows an error and keeps input when the save fails", async () => {
    const { onSaved, user } = setup(vi.fn().mockRejectedValue(new Error("500")));

    const role = screen.getByLabelText("Target role");
    await user.clear(role);
    await user.type(role, "UX Engineer");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn't save/i);
    expect(alert).toHaveFocus();
    expect(role).toHaveValue("UX Engineer");
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("links a returned field error to its field", async () => {
    const { user } = setup(
      vi.fn<SaveProfile>(async () => ({
        ok: false,
        message: "Some fields need attention.",
        fieldErrors: { targetRole: "Target role is required." },
      })),
    );

    await user.clear(screen.getByLabelText("Target role"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    const field = await screen.findByLabelText("Target role");
    expect(await screen.findByRole("alert")).toHaveTextContent("Some fields need attention.");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Target role is required.");
  });

  it("disables Save while saving so it can't be submitted twice", async () => {
    let finish: () => void = () => {};
    const onSave = vi.fn<SaveProfile>(
      (profile) =>
        new Promise((resolve) => {
          finish = () => resolve({ ok: true, profile });
        }),
    );
    const { user } = setup(onSave);

    await user.click(screen.getByRole("button", { name: "Save" }));
    const saving = screen.getByRole("button", { name: "Saving…" });
    expect(saving).toBeDisabled();
    await user.click(saving);
    expect(onSave).toHaveBeenCalledTimes(1);
    finish();
  });

  it("can be submitted with the keyboard", async () => {
    const onSave = vi.fn<SaveProfile>(async (profile) => ({ ok: true, profile }));
    const { user } = setup(onSave);

    await user.keyboard("{Enter}");
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel without saving", async () => {
    const onSave = vi.fn();
    const { onCancel, user } = setup(onSave);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
