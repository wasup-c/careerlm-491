// [S4-M2] Résumé submission form — component, state and accessibility tests.
// All résumé text below is synthetic.

import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ResumeSaveResult, SavedResumeSummary } from "@/lib/resumeSave";
import { MAX_RESUME_TEXT_LENGTH } from "@/lib/resumeLimits";

import ResumeForm from "./ResumeForm";

const SAVED: SavedResumeSummary = {
  text: "Existing résumé text",
  characterCount: 20,
  updatedAt: "2026-11-09T20:00:00.000Z",
};

function renderForm(
  overrides: Partial<React.ComponentProps<typeof ResumeForm>> = {},
) {
  const onSave = vi.fn(async (text: string): Promise<ResumeSaveResult> => ({
    ok: true,
    resume: { text: text.trim(), characterCount: text.trim().length, updatedAt: "2026-11-10T01:00:00.000Z" },
  }));
  const onDelete = vi.fn(async () => ({ ok: true as const }));

  render(<ResumeForm initialResume={null} onSave={onSave} onDelete={onDelete} {...overrides} />);

  return { onSave, onDelete, field: screen.getByLabelText("Résumé text") };
}

describe("ResumeForm", () => {
  it("shows the empty state, the input requirements and a labeled text area", () => {
    const { field } = renderForm();

    expect(screen.getByRole("heading", { name: "Add your résumé" })).toBeInTheDocument();
    expect(screen.getByText("No résumé saved yet.")).toBeInTheDocument();
    expect(field).toHaveAccessibleDescription(/up to 100,000 characters/i);
    expect(screen.getByText("0 / 100,000 characters")).toBeInTheDocument();
  });

  it("shows an existing résumé with its size and lets the user delete it", () => {
    renderForm({ initialResume: SAVED });

    expect(screen.getByRole("heading", { name: "Update your résumé" })).toBeInTheDocument();
    expect(screen.getByLabelText("Résumé text")).toHaveValue("Existing résumé text");
    expect(screen.getByText(/Saved résumé: 20 characters, last updated/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete résumé" })).toBeInTheDocument();
  });

  it("updates the character counter as the user types", async () => {
    const { field } = renderForm();

    await userEvent.type(field, "Hello");

    expect(screen.getByText("5 / 100,000 characters")).toBeInTheDocument();
  });

  it("blocks an empty save, ties the error to the field and keeps focus there", async () => {
    const { field, onSave } = renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Save résumé" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(/Paste your résumé text before saving\./);
    expect(field).toHaveFocus();
  });

  it("marks text over the limit as invalid and disables saving", () => {
    const { field } = renderForm();

    fireEvent.change(field, { target: { value: "a".repeat(MAX_RESUME_TEXT_LENGTH + 1) } });

    expect(screen.getByText("100,001 / 100,000 characters")).toBeInTheDocument();
    expect(screen.getByText("Over the limit by 1 character.")).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "Save résumé" })).toBeDisabled();
  });

  it("saves, shows a status message and switches to the saved state", async () => {
    const { field, onSave } = renderForm();

    await userEvent.type(field, "My synthetic résumé");
    await userEvent.click(screen.getByRole("button", { name: "Save résumé" }));

    expect(onSave).toHaveBeenCalledWith("My synthetic résumé");
    expect(await screen.findByRole("status")).toHaveTextContent("Résumé saved.");
    expect(screen.getByRole("heading", { name: "Update your résumé" })).toBeInTheDocument();
  });

  it("shows Saving… and prevents a second submit while saving", async () => {
    let finish: (result: ResumeSaveResult) => void = () => {};
    const onSave = vi.fn(
      () => new Promise<ResumeSaveResult>((resolve) => {
        finish = resolve;
      }),
    );
    const { field } = renderForm({ onSave });

    await userEvent.type(field, "Résumé text");
    await userEvent.click(screen.getByRole("button", { name: "Save résumé" }));

    const savingButton = screen.getByRole("button", { name: "Saving…" });
    expect(savingButton).toBeDisabled();
    fireEvent.submit(savingButton.closest("form")!);
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish({ ok: true, resume: { text: "Résumé text", characterCount: 11, updatedAt: SAVED.updatedAt } });
    });
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("shows a server error as an alert and keeps the user's text", async () => {
    const onSave = vi.fn(async (): Promise<ResumeSaveResult> => ({
      ok: false,
      message: "We couldn't save your résumé. Your text is still here, so you can try again.",
    }));
    const { field } = renderForm({ onSave });

    await userEvent.type(field, "Keep this text");
    await userEvent.click(screen.getByRole("button", { name: "Save résumé" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't save your résumé.");
    expect(alert).toHaveFocus();
    expect(field).toHaveValue("Keep this text");
  });

  it("shows a server field error under the text area", async () => {
    const onSave = vi.fn(async (): Promise<ResumeSaveResult> => ({
      ok: false,
      message: "Your résumé needs attention.",
      fieldError: "Your résumé text is too long.",
    }));
    const { field } = renderForm({ onSave });

    await userEvent.type(field, "Text");
    await userEvent.click(screen.getByRole("button", { name: "Save résumé" }));

    expect(field).toHaveAccessibleDescription(/Your résumé text is too long\./);
  });

  it("does not crash when the save request itself throws", async () => {
    const onSave = vi.fn(async () => {
      throw new Error("network down");
    });
    const { field } = renderForm({ onSave });

    await userEvent.type(field, "Text");
    await userEvent.click(screen.getByRole("button", { name: "Save résumé" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Your text is still here");
  });

  it("asks for confirmation before deleting, and Cancel keeps the résumé", async () => {
    const { onDelete } = renderForm({ initialResume: SAVED });

    await userEvent.click(screen.getByRole("button", { name: "Delete résumé" }));
    expect(screen.getByText(/Delete your saved résumé\? This can.t be undone\./)).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Résumé text")).toHaveValue("Existing résumé text");
  });

  it("deletes after confirmation and returns to the empty state", async () => {
    const { onDelete } = renderForm({ initialResume: SAVED });

    await userEvent.click(screen.getByRole("button", { name: "Delete résumé" }));
    await userEvent.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("status")).toHaveTextContent("Résumé deleted.");
    expect(screen.getByLabelText("Résumé text")).toHaveValue("");
    expect(screen.getByText("No résumé saved yet.")).toBeInTheDocument();
  });

  it("can be saved with the keyboard only", async () => {
    const { onSave } = renderForm();

    await userEvent.tab();
    expect(screen.getByLabelText("Résumé text")).toHaveFocus();
    await userEvent.keyboard("Typed with the keyboard");
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Save résumé" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    expect(onSave).toHaveBeenCalledWith("Typed with the keyboard");
  });
});
