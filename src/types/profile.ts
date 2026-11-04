import type {
    ExperienceLevel,
  } from "@/lib/persistence";
  
  export interface DashboardProfile {
    name?: string;
  
    targetRole?: string;
  
    experienceLevel?: ExperienceLevel;
  }
  
  export type ProfileField =
    keyof DashboardProfile;
  
  export type ProfileUpdateResult =
    | {
        ok: true;
  
        profile:
          DashboardProfile;
      }
    | {
        ok: false;
  
        message: string;
  
        fieldErrors?: Partial<
          Record<
            ProfileField,
            string
          >
        >;
      };
  
  export type SaveProfile = (
    profile: DashboardProfile
  ) => Promise<ProfileUpdateResult>;