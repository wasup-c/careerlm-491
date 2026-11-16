// SCRUM-266 [S5-M2-03] — job result card.
//
// Presentation only: shows one JobOpportunity exactly as Member 1's job
// service returns it. It never fetches, scores or ranks jobs (match
// information is added in SCRUM-269 once Member 3's format is agreed).
// Optional fields are shown only when present, so a job with just the
// required fields still renders a complete card.

import type {
  JobEmploymentType,
  JobExperienceLevel,
  JobOpportunity,
  JobSalary,
  JobWorkplaceType,
} from "@/lib/jobs";

interface JobCardProps {
  job: JobOpportunity;
  /** Heading level for the job title; 3 when cards sit under an h2 results heading. */
  headingLevel?: 2 | 3;
}

/** Skills shown before collapsing the rest into "+N more". */
export const MAX_VISIBLE_SKILLS = 6;

/** Description characters shown on the card. */
export const DESCRIPTION_PREVIEW_LENGTH = 220;

const WORKPLACE_LABELS: Record<JobWorkplaceType, string | null> = {
  remote: "Remote",
  hybrid: "Hybrid",
  "on-site": "On-site",
  unspecified: null,
};

const EMPLOYMENT_LABELS: Record<JobEmploymentType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
  other: "Other",
};

const EXPERIENCE_LABELS: Record<JobExperienceLevel, string | null> = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
  lead: "Lead",
  executive: "Executive",
  unspecified: null,
};

const INTERVAL_LABELS: Record<NonNullable<JobSalary["interval"]>, string> = {
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
  year: "year",
};

function formatMoney(amount: number, currency: string | undefined): string {
  if (currency) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      // Unknown currency code: fall through to a plain number with the code.
    }
  }

  const plain = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
  return currency ? `${plain} ${currency}` : plain;
}

export function formatSalary(salary: JobSalary | undefined): string | null {
  if (!salary || (salary.min === undefined && salary.max === undefined)) {
    return null;
  }

  const { min, max, currency, interval } = salary;
  let range: string;

  if (min !== undefined && max !== undefined) {
    range = min === max
      ? formatMoney(min, currency)
      : `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
  } else if (min !== undefined) {
    range = `From ${formatMoney(min, currency)}`;
  } else {
    range = `Up to ${formatMoney(max as number, currency)}`;
  }

  return interval ? `${range} per ${INTERVAL_LABELS[interval]}` : range;
}

export function formatPostedDate(postedAt: string | undefined): string | null {
  if (!postedAt) {
    return null;
  }

  const date = new Date(postedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function previewDescription(description: string | undefined): string | null {
  const text = description?.replace(/\s+/g, " ").trim();
  if (!text) {
    return null;
  }

  if (text.length <= DESCRIPTION_PREVIEW_LENGTH) {
    return text;
  }

  // Cut at the last space before the limit so words are not split.
  const cut = text.slice(0, DESCRIPTION_PREVIEW_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export default function JobCard({ job, headingLevel = 3 }: JobCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const headingId = `job-${job.source}-${job.providerJobId}`.replace(/[^A-Za-z0-9_-]/g, "-");

  const details = [
    job.location?.trim() || null,
    WORKPLACE_LABELS[job.workplaceType],
    job.employmentType ? EMPLOYMENT_LABELS[job.employmentType] : null,
    job.experienceLevel ? EXPERIENCE_LABELS[job.experienceLevel] : null,
  ].filter((value): value is string => Boolean(value));

  const salary = formatSalary(job.salary);
  const posted = formatPostedDate(job.postedAt);
  const description = previewDescription(job.description);
  const visibleSkills = job.skills.slice(0, MAX_VISIBLE_SKILLS);
  const hiddenSkillCount = job.skills.length - visibleSkills.length;

  return (
    <article
      aria-labelledby={headingId}
      className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <Heading
        id={headingId}
        className="break-words text-lg font-semibold text-slate-900 [overflow-wrap:anywhere]"
      >
        {job.title}
      </Heading>

      <p className="mt-1 break-words font-medium text-slate-700 [overflow-wrap:anywhere]">
        {job.company}
      </p>

      {details.length > 0 ? (
        <ul aria-label="Job details" className="mt-3 flex flex-wrap gap-2">
          {details.map((detail) => (
            <li
              key={detail}
              className="max-w-full break-words rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 [overflow-wrap:anywhere]"
            >
              {detail}
            </li>
          ))}
        </ul>
      ) : null}

      {salary || posted ? (
        <dl className="mt-3 space-y-1 text-sm">
          {salary ? (
            <div className="flex flex-wrap gap-x-1">
              <dt className="text-slate-500">Salary:</dt>
              <dd className="text-slate-900">{salary}</dd>
            </div>
          ) : null}
          {posted ? (
            <div className="flex flex-wrap gap-x-1">
              <dt className="text-slate-500">Posted:</dt>
              <dd className="text-slate-900">{posted}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {description ? (
        <p className="mt-3 break-words text-sm text-slate-600 [overflow-wrap:anywhere]">
          {description}
        </p>
      ) : null}

      {visibleSkills.length > 0 ? (
        <ul aria-label="Skills" className="mt-3 flex flex-wrap gap-2">
          {visibleSkills.map((skill) => (
            <li
              key={skill}
              className="max-w-full break-words rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-800 [overflow-wrap:anywhere]"
            >
              {skill}
            </li>
          ))}
          {hiddenSkillCount > 0 ? (
            <li className="rounded-full px-3 py-1 text-sm text-slate-500">
              +{hiddenSkillCount} more
            </li>
          ) : null}
        </ul>
      ) : null}

      {/* mt-auto keeps the button at the bottom when cards share a grid row. */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Apply for ${job.title} at ${job.company} (opens in a new tab)`}
          className="inline-flex items-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          Apply
          <span aria-hidden="true" className="ml-1">↗</span>
        </a>
        <p className="text-xs text-slate-500">via {job.source}</p>
      </div>
    </article>
  );
}
