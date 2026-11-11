// Shared by the résumé form (client) and the save logic (server), so both
// apply exactly the same rule.
//
// 100,000 characters of résumé text, counted with JavaScript's .length
// (UTF-16 code units), as proposed by Member 3 for RN-08A/RN-08B. These
// checks are usability guards for the /resume page; Member 3's server-side
// validation remains the authoritative limit.
export const MAX_RESUME_TEXT_LENGTH = 100_000;

/** The counter is announced to screen readers from this point on. */
export const RESUME_LENGTH_WARNING_AT = 90_000;

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function validateResumeText(text: string): string | undefined {
  const trimmed = text.trim();

  if (!trimmed) {
    return "Paste your résumé text before saving.";
  }

  if (trimmed.length > MAX_RESUME_TEXT_LENGTH) {
    return `Your résumé text is too long (${formatCount(trimmed.length)} / ${formatCount(MAX_RESUME_TEXT_LENGTH)} characters). Shorten it and try again.`;
  }

  return undefined;
}
