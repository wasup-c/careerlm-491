import type { ExperienceLevel } from "@/lib/persistence";

/**
 * TEMPORARY Sprint 3 dashboard/profile view model.
 *
 * targetRole and experienceLevel mirror fields already available on
 * QuestionnaireRecord. Replace this with the shared profile contract
 * once Member 3's profile service is merged.
 *
 * Every field is optional on purpose: the dashboard must render
 * partial profiles without crashing.
 */
export interface TemporaryDashboardProfile {
  name?: string;
  targetRole?: string;
  experienceLevel?: ExperienceLevel;
}
  
