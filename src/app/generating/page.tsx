import {
  redirect,
} from "next/navigation";

/**
 * Roadmap generation now happens through POST /api/roadmap while the
 * onboarding form is submitting.
 *
 * The generated roadmap is persisted server-side before the user is sent to
 * /roadmap, so the original sessionStorage-based generation page is no
 * longer part of CareerLM's runtime flow.
 *
 * Keep this route as a compatibility redirect for old links/bookmarks.
 */
export default function GeneratingPage() {
  redirect(
    "/roadmap"
  );
}