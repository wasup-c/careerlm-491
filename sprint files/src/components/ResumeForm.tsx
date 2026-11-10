"use client";

// [S4-M2] Résumé submission form. Lets the current user paste, save,
// replace and delete their résumé text. Saving and deleting go through
// server actions; this component never handles a user ID.

import { useEffect, useRef, useState, type FormEvent } from "react";

import type {
  ResumeDeleteResult,
  ResumeSaveResult,
  SavedResumeSummary,
} from "@/lib/resumeSave";
import {
  MAX_RESUME_TEXT_LENGTH,
  RESUME_LENGTH_WARNING_AT,
  formatCount,
  validateResumeText,
} from "@/lib/resumeLimits";

interface ResumeFormProps {
  initialResume: SavedResumeSummary | null;
  onSave: (text: string) => Promise<ResumeSaveResult>;
  onDelete: () => Promise<ResumeDeleteResult>;
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600";

const primaryButton = `inline-flex items-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

const secondaryButton = `inline-flex items-center rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

const dangerButton = `inline-flex items-center rounded-md border border-red-300 px-4 py-2 font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

function characters(value: number): string {
  return `${formatCount(value)} ${value === 1 ? "character" : "characters"}`;
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "recently"
    : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function ResumeForm({ initialResume, onSave, onDelete }: ResumeFormProps) {
  const [saved, setSaved] = useState<SavedResumeSummary | null>(initialResume);
  const [text, setText] = useState(initialResume?.text ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [busy, setBusy] = useState<"saving" | "deleting" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const confirmRef = useRef<HTMLParagraphElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const count = text.trim().length;
  const overLimit = count > MAX_RESUME_TEXT_LENGTH;
  const nearLimit = count >= RESUME_LENGTH_WARNING_AT;

  useEffect(() => {
    if (generalError) {
      errorRef.current?.focus();
    }
  }, [generalError]);

  useEffect(() => {
    if (confirmingDelete) {
      confirmRef.current?.focus();
    }
  }, [confirmingDelete]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) {
      return;
    }

    setStatusMessage("");
    setGeneralError(null);

    const error = validateResumeText(text);
    if (error) {
      setFieldError(error);
      textareaRef.current?.focus();
      return;
    }

    setFieldError(null);
    setBusy("saving");

    try {
      const result = await onSave(text);

      if (result.ok) {
        setSaved(result.resume);
        setText(result.resume.text);
        setStatusMessage("Résumé saved.");
      } else if (result.fieldError) {
        setFieldError(result.fieldError);
        textareaRef.current?.focus();
      } else {
        setGeneralError(result.message);
      }
    } catch {
      setGeneralError(
        "We couldn't save your résumé. Your text is still here, so you can try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (busy) {
      return;
    }

    setStatusMessage("");
    setGeneralError(null);
    setBusy("deleting");

    try {
      const result = await onDelete();

      if (result.ok) {
        setSaved(null);
        setText("");
        setFieldError(null);
        setConfirmingDelete(false);
        setStatusMessage("Résumé deleted.");
        textareaRef.current?.focus();
      } else {
        setConfirmingDelete(false);
        setGeneralError(result.message);
      }
    } catch {
      setConfirmingDelete(false);
      setGeneralError("We couldn't delete your résumé. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const describedBy = ["resume-text-hint", "resume-text-count", fieldError ? "resume-text-error" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      aria-labelledby="resume-form-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id="resume-form-heading" className="text-lg font-semibold text-slate-900">
        {saved ? "Update your résumé" : "Add your résumé"}
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        {saved
          ? `Saved résumé: ${formatCount(saved.characterCount)} characters, last updated ${formatUpdatedAt(saved.updatedAt)}.`
          : "No résumé saved yet."}
      </p>

      {generalError ? (
        <p
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {generalError}
        </p>
      ) : null}

      <form className="mt-6" onSubmit={handleSubmit} noValidate>
        <label htmlFor="resume-text" className="text-sm font-medium text-slate-700">
          Résumé text
        </label>

        <p id="resume-text-hint" className="mt-1 text-sm text-slate-500">
          Paste the text of your résumé, up to {formatCount(MAX_RESUME_TEXT_LENGTH)} characters. Uploading
          a PDF or Word file isn&rsquo;t supported yet.
        </p>

        <textarea
          id="resume-text"
          ref={textareaRef}
          name="resume"
          rows={14}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setStatusMessage("");
            if (fieldError) {
              setFieldError(null);
            }
          }}
          aria-invalid={fieldError || overLimit ? true : undefined}
          aria-describedby={describedBy}
          disabled={busy !== null}
          className={`mt-2 block w-full rounded-md border px-3 py-2 text-slate-900 shadow-sm ${focusRing} ${
            fieldError || overLimit ? "border-red-500" : "border-slate-300"
          }`}
        />

        <p
          id="resume-text-count"
          className={`mt-1 text-right text-sm ${overLimit ? "font-medium text-red-700" : "text-slate-500"}`}
        >
          {formatCount(count)} / {formatCount(MAX_RESUME_TEXT_LENGTH)} characters
        </p>

        {/* Announced only near or over the limit, not on every keystroke. */}
        <p className="sr-only" aria-live="polite">
          {overLimit
            ? `Over the limit by ${characters(count - MAX_RESUME_TEXT_LENGTH)}.`
            : nearLimit
              ? `${characters(MAX_RESUME_TEXT_LENGTH - count)} left.`
              : ""}
        </p>

        {fieldError ? (
          <p id="resume-text-error" className="mt-1 text-sm text-red-700">
            {fieldError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" className={primaryButton} disabled={busy !== null || overLimit}>
            {busy === "saving" ? "Saving…" : saved ? "Save changes" : "Save résumé"}
          </button>

          {saved && !confirmingDelete ? (
            <button
              ref={deleteButtonRef}
              type="button"
              className={dangerButton}
              disabled={busy !== null}
              onClick={() => {
                setStatusMessage("");
                setConfirmingDelete(true);
              }}
            >
              Delete résumé
            </button>
          ) : null}
        </div>
      </form>

      {confirmingDelete ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p ref={confirmRef} tabIndex={-1} className="text-sm text-red-800">
            Delete your saved résumé? This can&rsquo;t be undone.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className={dangerButton}
              disabled={busy !== null}
              onClick={handleDelete}
            >
              {busy === "deleting" ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={busy !== null}
              onClick={() => {
                setConfirmingDelete(false);
                // Return focus to where the user started.
                requestAnimationFrame(() => deleteButtonRef.current?.focus());
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <p role="status" className="mt-4 text-sm text-teal-700">
        {statusMessage}
      </p>
    </section>
  );
}
