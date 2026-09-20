import type { QuestionnaireResponse } from "@/types/career";

export const mockQuestionnaire: QuestionnaireResponse = {
  targetCareerRole: "Full-Stack Developer",
  experienceLevel: "Beginner",
  existingSkills: [
    "HTML",
    "CSS",
    "JavaScript",
  ],
  preferredLearningStyle: "Project-Based",
  weeklyTimeCommitment: 8,
};
