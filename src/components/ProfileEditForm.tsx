"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { ExperienceLevel } from "@/lib/persistence";
import type {
  ProfileField,
  SaveProfile,
} from "@/lib/fixtures/mockProfileService";
import type { TemporaryDashboardProfile } from "@/types/dashboard";

interface ProfileEditFormProps {
  initial: TemporaryDashboardProfile;
  onSave: SaveProfile;
  onSaved: (profile: TemporaryDashboardProfile) => void;
  onCancel: () => void;
}

const SAVE_FAILED =
  "We couldn't save your profile. Your changes are still here, so you can try again.";

const fieldClass =
  "mt-1 block w-full rounded-md border px-3 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600";

export default function ProfileEditForm({
  initial,
  onSave,
  onSaved,
  onCancel,
}: ProfileEditFormProps) {
  const [name, setName] = useState(initial.name ?? "");
  const [targetRole, setTargetRole] = useState(initial.targetRole ?? "");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(
    initial.experienceLevel ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProfileField, string>>
  >({});

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return; // prevent duplicate submissions

    setSaving(true);
    setGeneralError(null);
    setFieldErrors({});

    const profile: TemporaryDashboardProfile = {
      name: name.trim() || undefined,
      targetRole: targetRole.trim() || undefined,
      experienceLevel: experienceLevel || undefined,
    };

    try {
      const result = await onSave(profile);
      if (result.ok) {
        onSaved(result.profile);
        return;
      }
      setFieldErrors(result.fieldErrors ?? {});
      setGeneralError(result.message);
    } catch {
      setGeneralError(SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (generalError) errorRef.current?.focus();
  }, [generalError]);

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
      {generalError && (
        <p
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {generalError}
        </p>
      )}

      <div>
        <label htmlFor="profile-name" className="text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          ref={firstFieldRef}
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "profile-name-error" : undefined}
          className={`${fieldClass} ${fieldErrors.name ? "border-red-500" : "border-slate-300"}`}
        />
        {fieldErrors.name && (
          <p id="profile-name-error" className="mt-1 text-sm text-red-700">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="profile-target-role" className="text-sm font-medium text-slate-700">
          Target role
        </label>
        <input
          id="profile-target-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          aria-invalid={fieldErrors.targetRole ? true : undefined}
          aria-describedby={
            fieldErrors.targetRole ? "profile-target-role-error" : undefined
          }
          className={`${fieldClass} ${fieldErrors.targetRole ? "border-red-500" : "border-slate-300"}`}
        />
        {fieldErrors.targetRole && (
          <p id="profile-target-role-error" className="mt-1 text-sm text-red-700">
            {fieldErrors.targetRole}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="profile-experience" className="text-sm font-medium text-slate-700">
          Experience level
        </label>
        <select
          id="profile-experience"
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | "")}
          className={`${fieldClass} border-slate-300 bg-white`}
        >
          <option value="">Not set</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
