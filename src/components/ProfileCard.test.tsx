import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProfileCard from "./ProfileCard";
import {
  completeProfile,
  emptyProfile,
  partialProfile,
} from "@/lib/fixtures/dashboard";

// SCRUM-162 [S3-M2-TEST] — ProfileCard rendering
describe("ProfileCard", () => {
  it("has an accessible Profile section", () => {
    render(<ProfileCard profile={completeProfile} />);
    expect(screen.getByRole("region", { name: "Profile" })).toBeInTheDocument();
  });

  it("renders every field of a complete profile", () => {
    render(<ProfileCard profile={completeProfile} />);
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
  });

  it("shows placeholders for missing fields in a partial profile", () => {
    render(<ProfileCard profile={partialProfile} />);
    expect(screen.getByText("Data Analyst")).toBeInTheDocument();
    expect(screen.getAllByText("Not set yet")).toHaveLength(2);
  });

  it("treats whitespace-only values as missing", () => {
    render(<ProfileCard profile={{ name: "   ", targetRole: "QA Engineer" }} />);
    expect(screen.getAllByText("Not set yet")).toHaveLength(2);
  });

  it("shows an empty state when there is no profile data", () => {
    render(<ProfileCard profile={emptyProfile} />);
    expect(screen.getByText(/no profile details yet/i)).toBeInTheDocument();
    expect(screen.queryByText("Not set yet")).not.toBeInTheDocument();
  });
});
