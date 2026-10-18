import {
  render,
  screen,
} from "@testing-library/react";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  ReactNode,
} from "react";

import type {
  RoadmapRecord,
} from "@/lib/persistence/domain";

const mocks =
  vi.hoisted(() => ({
    getMyRoadmap:
      vi.fn(),
  }));

vi.mock(
  "@/lib/services/default-career-data-service",
  () => ({
    careerDataService: {
      getMyRoadmap:
        mocks.getMyRoadmap,
    },
  })
);

vi.mock(
  "@/components/SharedLayout",
  () => ({
    default: ({
      children,
    }: {
      children:
        ReactNode;
    }) => (
      <div>
        {children}
      </div>
    ),
  })
);

vi.mock(
  "next/link",
  () => ({
    default: ({
      children,
      href,
    }: {
      children:
        ReactNode;
      href:
        string;
    }) => (
      <a href={href}>
        {children}
      </a>
    ),
  })
);

import RoadmapPage from "./page";

const persistedRoadmap:
  RoadmapRecord = {
    id:
      "roadmap-user-a",

    userId:
      "user-a",

    title:
      "Test Career Roadmap",

    targetRole:
      "Software Engineer",

    estimatedWeeks: 12,

    createdAt:
      "2026-10-17T12:00:00.000Z",

    updatedAt:
      "2026-10-17T12:00:00.000Z",

    milestones: [
      {
        id:
          "third",

        order: 3,

        title:
          "Third Milestone",

        description:
          "Third milestone description",

        estimatedHours: 8,

        skills: [
          "React",
        ],

        status:
          "not-started",
      },

      {
        id:
          "first",

        order: 1,

        title:
          "First Milestone",

        description:
          "First milestone description",

        estimatedHours: 5,

        skills: [
          "HTML",
        ],

        status:
          "completed",
      },

      {
        id:
          "second",

        order: 2,

        title:
          "Second Milestone",

        description:
          "Second milestone description",

        estimatedHours: 6,

        skills: [
          "TypeScript",
        ],

        status:
          "in-progress",
      },
    ],
  };

async function renderRoadmapPage() {
  const page =
    await RoadmapPage();

  render(page);
}

describe(
  "RoadmapPage regression tests",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.getMyRoadmap
        .mockResolvedValue(
          persistedRoadmap
        );
    });

    it(
      "loads the current user's persisted roadmap through CareerDataService",
      async () => {
        await renderRoadmapPage();

        expect(
          mocks.getMyRoadmap
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );

    it(
      "renders the target role and estimated duration",
      async () => {
        await renderRoadmapPage();

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Your path to Software Engineer",
            }
          )
        ).toBeDefined();

        expect(
          screen.getByText(
            "12 weeks"
          )
        ).toBeDefined();
      }
    );

    it(
      "renders milestones in ascending order",
      async () => {
        await renderRoadmapPage();

        const headings =
          screen.getAllByRole(
            "heading",
            {
              level: 2,
            }
          );

        expect(
          headings.map(
            (
              heading
            ) =>
              heading.textContent
          )
        ).toEqual([
          "First Milestone",
          "Second Milestone",
          "Third Milestone",
        ]);
      }
    );

    it(
      "renders progress based on completed milestones",
      async () => {
        await renderRoadmapPage();

        const progressbar =
          screen.getByRole(
            "progressbar",
            {
              name:
                "Roadmap progress",
            }
          );

        expect(
          progressbar.getAttribute(
            "aria-valuenow"
          )
        ).toBe(
          "33"
        );

        expect(
          progressbar.getAttribute(
            "aria-valuemin"
          )
        ).toBe(
          "0"
        );

        expect(
          progressbar.getAttribute(
            "aria-valuemax"
          )
        ).toBe(
          "100"
        );
      }
    );

    it(
      "renders an onboarding empty state when no persisted roadmap exists",
      async () => {
        mocks.getMyRoadmap
          .mockResolvedValueOnce(
            null
          );

        await renderRoadmapPage();

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                /no roadmap yet/i,
            }
          )
        ).toBeDefined();

        expect(
          screen.getByRole(
            "link",
            {
              name:
                /start onboarding/i,
            }
          )
        ).toHaveAttribute(
          "href",
          "/onboarding"
        );
      }
    );
  }
);

describe(
  "RoadmapPage portfolio journey handoff",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.getMyRoadmap
        .mockResolvedValue(
          persistedRoadmap
        );
    });

    it(
      "provides a path from the roadmap to the portfolio",
      async () => {
        await renderRoadmapPage();

        const portfolioLink =
          screen.getByRole(
            "link",
            {
              name:
                /view portfolio/i,
            }
          );

        expect(
          portfolioLink
        ).toHaveAttribute(
          "href",
          "/portfolio"
        );
      }
    );
  }
);