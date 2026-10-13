"use client";

import { useEffect, useRef, useState } from "react";

import ProfileCard from "@/components/ProfileCard";
import ProfileEditForm from "@/components/ProfileEditForm";
import {
  mockSaveProfile,
  type SaveProfile,
} from "@/lib/fixtures/mockProfileService";
import type { TemporaryDashboardProfile } from "@/types/dashboard";

interface ProfileSectionProps {
  initialProfile: TemporaryDashboardProfile;
  /** Defaults to the temporary mock until Member 3's service is merged. */
  onSave?: SaveProfile;
}

/**
 * Switches the dashboard profile between view mode (ProfileCard) and
 * edit mode (ProfileEditForm), and announces a successful save.
 */
export default function ProfileSection({
  initialProfile,
  onSave = mockSaveProfile,
}: ProfileSectionProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (!editing && returnFocus.current) {
      editButtonRef.current?.focus();
      returnFocus.current = false;
    }
  }, [editing]);

  function closeEditor() {
    returnFocus.current = true;
    setEditing(false);
  }

  if (editing) {
    return (
      <section
        aria-labelledby="profile-heading"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="profile-heading" className="text-lg font-semibold text-slate-900">
          Edit profile
        </h2>
        <ProfileEditForm
          initial={profile}
          onSave={onSave}
          onSaved={(saved) => {
            setProfile(saved);
            setSavedMessage("Profile saved.");
            closeEditor();
          }}
          onCancel={closeEditor}
        />
      </section>
    );
  }

  return (
    <ProfileCard profile={profile}>
      <p role="status" className="mt-4 text-sm text-teal-700">
        {savedMessage}
      </p>
      <button
        ref={editButtonRef}
        type="button"
        onClick={() => {
          setSavedMessage("");
          setEditing(true);
        }}
        className="mt-2 inline-flex items-center rounded-md border border-teal-600 px-4 py-2 font-medium text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        Edit profile
      </button>
    </ProfileCard>
  );
}
