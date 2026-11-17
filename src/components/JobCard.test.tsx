// SCRUM-266 [S5-M2-03] / SCRUM-164 — JobCard tests.
// Uses synthetic fixtures only; no live job provider is called.

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FULL_JOB, LONG_TEXT_JOB, MINIMAL_JOB } from "@/lib/fixtures/jobs";
import type { JobOpportunity } from "@/lib/jobs";

import JobCard, {
  DESCRIPTION_PREVIEW_LENGTH,
  MAX_VISIBLE_SKILLS,
  formatPostedDate,
  formatSalary,
  previewDescription,
} from "./JobCard";

describe("JobCard with every field", () => {
  it("shows the title as a heading the card is named by", () => {
    render(<JobCard job={FULL_JOB} />);

    expect(screen.getByRole("heading", { level: 3, name: "Junior Frontend Engineer" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Junior Frontend Engineer" })).toBeInTheDocument();
  });

  it("shows company, details, salary, posted date, description and skills", () => {
    render(<JobCard job={FULL_JOB} />);

    expect(screen.getByText("Example Labs")).toBeInTheDocument();

    const details = within(screen.getByRole("list", { name: "Job details" }));
    expect(details.getByText("Los Angeles, CA")).toBeInTheDocument();
    expect(details.getByText("Hybrid")).toBeInTheDocument();
    expect(details.getByText("Full-time")).toBeInTheDocument();
    expect(details.getByText("Entry level")).toBeInTheDocument();

    expect(screen.getByText("$70,000 – $90,000 per year")).toBeInTheDocument();
    expect(screen.getByText("Nov 3, 2026")).toBeInTheDocument();
    expect(screen.getByText(/Build accessible React interfaces/)).toBeInTheDocument();

    const skills = within(screen.getByRole("list", { name: "Skills" }));
    expect(skills.getAllByRole("listitem")).toHaveLength(4);
  });

  it("links Apply to the job in a new tab with a descriptive name", () => {
    render(<JobCard job={FULL_JOB} />);

    const apply = screen.getByRole("link", {
      name: "Apply for Junior Frontend Engineer at Example Labs (opens in a new tab)",
    });
    expect(apply).toHaveAttribute("href", "https://jobs.example.com/apply/1001");
    expect(apply).toHaveAttribute("target", "_blank");
    expect(apply).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("credits the job source", () => {
    render(<JobCard job={FULL_JOB} />);

    expect(screen.getByText("via Jobicy")).toBeInTheDocument();
  });
});

describe("JobCard with only the required fields", () => {
  it("renders title, company and Apply without crashing", () => {
    render(<JobCard job={MINIMAL_JOB} />);

    expect(screen.getByRole("heading", { name: "Software Engineer" })).toBeInTheDocument();
    expect(screen.getByText("Sample Co")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Apply for Software Engineer at Sample Co/ })).toBeInTheDocument();
  });

  it("leaves out every optional section instead of showing empty labels", () => {
    render(<JobCard job={MINIMAL_JOB} />);

    expect(screen.queryByRole("list", { name: "Job details" })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Skills" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Salary:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Posted:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/undefined|null|NaN/)).not.toBeInTheDocument();
  });

  it("ignores a whitespace-only location and an unparseable posted date", () => {
    const job: JobOpportunity = { ...MINIMAL_JOB, location: "   ", postedAt: "not-a-date" };

    render(<JobCard job={job} />);

    expect(screen.queryByRole("list", { name: "Job details" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Posted:/)).not.toBeInTheDocument();
  });
});

describe("JobCard with very long text", () => {
  it("renders the full long title and company with wrapping classes", () => {
    render(<JobCard job={LONG_TEXT_JOB} />);

    const heading = screen.getByRole("heading", { name: LONG_TEXT_JOB.title });
    expect(heading).toHaveClass("break-words");
    expect(heading.className).toContain("[overflow-wrap:anywhere]");
    expect(screen.getByText(LONG_TEXT_JOB.company)).toHaveClass("break-words");
  });

  it("lets the card shrink inside a grid instead of overflowing", () => {
    render(<JobCard job={LONG_TEXT_JOB} />);

    expect(screen.getByRole("article")).toHaveClass("min-w-0");
  });

  it("shortens a long description at a word boundary", () => {
    const longDescription = "word ".repeat(100).trim();
    render(<JobCard job={{ ...FULL_JOB, description: longDescription }} />);

    const preview = screen.getByText(/word…$/);
    expect(preview.textContent!.length).toBeLessThanOrEqual(DESCRIPTION_PREVIEW_LENGTH + 1);
  });

  it(`shows at most ${MAX_VISIBLE_SKILLS} skills and counts the rest`, () => {
    const skills = Array.from({ length: 9 }, (_, index) => `Skill ${index + 1}`);
    render(<JobCard job={{ ...FULL_JOB, skills }} />);

    const list = within(screen.getByRole("list", { name: "Skills" }));
    expect(list.getByText("Skill 6")).toBeInTheDocument();
    expect(list.queryByText("Skill 7")).not.toBeInTheDocument();
    expect(list.getByText("+3 more")).toBeInTheDocument();
  });
});

describe("JobCard options", () => {
  it("can use an h2 title when the card is not inside a results section", () => {
    render(<JobCard job={FULL_JOB} headingLevel={2} />);

    expect(screen.getByRole("heading", { level: 2, name: "Junior Frontend Engineer" })).toBeInTheDocument();
  });

  it("gives two cards different heading ids", () => {
    render(
      <>
        <JobCard job={FULL_JOB} />
        <JobCard job={MINIMAL_JOB} />
      </>,
    );

    const [first, second] = screen.getAllByRole("heading");
    expect(first.id).not.toBe(second.id);
  });
});

describe("formatting helpers", () => {
  it.each([
    [{ min: 70000, max: 90000, currency: "USD", interval: "year" as const }, "$70,000 – $90,000 per year"],
    [{ min: 25, currency: "USD", interval: "hour" as const }, "From $25 per hour"],
    [{ max: 5000, currency: "EUR", interval: "month" as const }, "Up to €5,000 per month"],
    [{ min: 80000, max: 80000, currency: "USD" }, "$80,000"],
    [{ min: 1000, max: 2000 }, "1,000 – 2,000"],
    [{ min: 100, currency: "XYZ1" }, "From 100 XYZ1"],
  ])("formats salary %j", (salary, expected) => {
    expect(formatSalary(salary)).toBe(expected);
  });

  it("returns null for a missing or empty salary", () => {
    expect(formatSalary(undefined)).toBeNull();
    expect(formatSalary({ currency: "USD" })).toBeNull();
  });

  it("formats the posted date in UTC so it doesn't shift by time zone", () => {
    expect(formatPostedDate("2026-11-03T00:00:00.000Z")).toBe("Nov 3, 2026");
    expect(formatPostedDate(undefined)).toBeNull();
  });

  it("collapses whitespace in descriptions and returns null when empty", () => {
    expect(previewDescription("  line one\n\n line   two ")).toBe("line one line two");
    expect(previewDescription("   ")).toBeNull();
  });
});
