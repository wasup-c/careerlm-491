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
  RoadmapRecord,
} from "@/lib/persistence";

const mocks =
  vi.hoisted(() => ({
    getMyRoadmap:
      vi.fn(),
  }));

vi.mock(
  "@/lib/services",
  () => ({
    careerDataService: {
      getMyRoadmap:
        mocks.getMyRoadmap,
    },
  })
);

import PortfolioPage from "./page";

const roadmap:
  RoadmapRecord = {
    id:
      "portfolio-roadmap",

    userId:
      "user-a",

    title:
      "Software Engineer Roadmap",

    targetRole:
      "Software Engineer",

    estimatedWeeks: 12,

    createdAt:
      "2026-11-01T12:00:00.000Z",

    updatedAt:
      "2026-11-01T12:00:00.000Z",

    milestones: [
      {
        id:
          "completed",

        order: 1,

        title:
          "Build a TypeScript project",

        description:
          "Create a production-style TypeScript project.",

        estimatedHours: 8,

        skills: [
          "TypeScript",
        ],

        status:
          "completed",
      },

      {
        id:
          "incomplete",

        order: 2,

        title:
          "Learn deployment",

        description:
          "Deploy an application.",

        estimatedHours: 6,

        skills: [
          "Deployment",
        ],

        status:
          "in-progress",
      },
    ],
  };

async function renderPage() {
  const page =
    await PortfolioPage();

  render(page);
}

describe(
  "PortfolioPage",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.getMyRoadmap
        .mockResolvedValue(
          roadmap
        );
    });

    it(
      "loads the current user's persisted roadmap",
      async () => {
        await renderPage();

        expect(
          mocks.getMyRoadmap
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );

    it(
      "shows completed roadmap work",
      async () => {
        await renderPage();

        expect(
          screen.getByText(
            "Build a TypeScript project"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "does not present incomplete work as completed",
      async () => {
        await renderPage();

        expect(
          screen.queryByText(
            "Learn deployment"
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "shows an onboarding path when no roadmap exists",
      async () => {
        mocks.getMyRoadmap
          .mockResolvedValueOnce(
            null
          );

        await renderPage();

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                /no roadmap yet/i,
            }
          )
        ).toBeInTheDocument();

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