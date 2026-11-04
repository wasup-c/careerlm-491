import type {
  ReactNode,
} from "react";

import type {
  ExperienceLevel,
} from "@/lib/persistence";

import type {
  DashboardProfile,
} from "@/types/profile";

interface ProfileCardProps {
  profile:
    DashboardProfile;

  children?: ReactNode;
}

const experienceLabels:
  Record<
    ExperienceLevel,
    string
  > = {
    beginner:
      "Beginner",

    intermediate:
      "Intermediate",

    advanced:
      "Advanced",
  };

const NOT_SET =
  "Not set yet";

export default function ProfileCard({
  profile,
  children,
}: ProfileCardProps) {
  const name =
    profile.name?.trim() ||
    undefined;

  const targetRole =
    profile.targetRole?.trim() ||
    undefined;

  const experience =
    profile.experienceLevel
      ? experienceLabels[
          profile
            .experienceLevel
        ]
      : undefined;

  const hasAnyDetail =
    Boolean(
      name ||
        targetRole ||
        experience
    );

  return (
    <section
      aria-labelledby="profile-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id="profile-heading"
        className="text-lg font-semibold text-slate-900"
      >
        Profile
      </h2>

      {hasAnyDetail ? (
        <dl className="mt-4 space-y-3">
          <ProfileRow
            label="Name"
            value={name}
          />

          <ProfileRow
            label="Target role"
            value={
              targetRole
            }
          />

          <ProfileRow
            label="Experience level"
            value={
              experience
            }
          />
        </dl>
      ) : (
        <p className="mt-2 text-slate-600">
          No profile details
          yet. Complete
          onboarding to add
          your target role and
          experience level.
        </p>
      )}

      {children}
    </section>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>

      <dd
        className={`break-words ${
          value
            ? "text-slate-900"
            : "italic text-slate-400"
        }`}
      >
        {value ?? NOT_SET}
      </dd>
    </div>
  );
}