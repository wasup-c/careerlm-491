import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import type {
  RoadmapMilestone,
} from "@/types/career";

vi.mock(
  "@/app/roadmap/actions",
  () => ({
    updateMilestoneStatusAction:
      vi.fn(),
  })
);

import MilestoneCard from "./MilestoneCard";

const baseMilestone:
  RoadmapMilestone = {
    id:
      "milestone-1",

    order: 1,

    title:
      "Build a TypeScript Project",

    description:
      "Create a project using TypeScript.",

    estimatedHours: 12,

    skills: [
      "TypeScript",
      "React",
    ],

    status:
      "not-started",
  };

describe(
  "MilestoneCard regression tests",
  () => {
    it.each([
      [
        "not-started",
        "Not started",
      ],

      [
        "in-progress",
        "In progress",
      ],

      [
        "completed",
        "Completed",
      ],
    ] as const)(
      "renders %s status correctly",
      (
        status,
        label
      ) => {
        render(
          <MilestoneCard
            milestone={{
              ...baseMilestone,
              status,
            }}
            position={1}
          />
        );

        /**
         * The current status is intentionally shown twice:
         *
         * 1. as the visible status badge;
         * 2. as the selected option in the progress control.
         *
         * Query the badge specifically so this regression test does not
         * become ambiguous now that milestone progress is editable.
         */
        expect(
          screen.getByText(
            label,
            {
              selector:
                "span",
            }
          )
        ).toBeDefined();

        const statusSelect =
          screen.getByRole(
            "combobox",
            {
              name:
                /progress status/i,
            }
          );

        expect(
          statusSelect
        ).toHaveValue(
          status
        );
      }
    );

    it(
      "renders milestone details from the shared contract",
      () => {
        render(
          <MilestoneCard
            milestone={
              baseMilestone
            }
            position={1}
          />
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Build a TypeScript Project",
            }
          )
        ).toBeDefined();

        expect(
          screen.getByText(
            "Create a project using TypeScript."
          )
        ).toBeDefined();

        expect(
          screen.getByText(
            "TypeScript"
          )
        ).toBeDefined();

        expect(
          screen.getByText(
            "React"
          )
        ).toBeDefined();

        expect(
          screen.getByText(
            /12 hours/
          )
        ).toBeDefined();
      }
    );

    it(
      "uses the supplied milestone position",
      () => {
        render(
          <MilestoneCard
            milestone={
              baseMilestone
            }
            position={3}
          />
        );

        expect(
          screen.getByText(
            "Milestone 3"
          )
        ).toBeDefined();
      }
    );

    it(
      "renders an empty skills list without crashing",
      () => {
        render(
          <MilestoneCard
            milestone={{
              ...baseMilestone,
              skills: [],
            }}
            position={1}
          />
        );

        expect(
          screen.getByRole(
            "list",
            {
              name:
                "Milestone skills",
            }
          )
        ).toBeDefined();

        expect(
          screen.queryAllByRole(
            "listitem"
          )
        ).toHaveLength(
          0
        );
      }
    );

    it(
      "renders the persisted milestone progress controls",
      () => {
        const {
          container,
        } =
          render(
            <MilestoneCard
              milestone={{
                ...baseMilestone,

                status:
                  "in-progress",
              }}
              position={1}
            />
          );

        const statusSelect =
          screen.getByRole(
            "combobox",
            {
              name:
                /progress status/i,
            }
          );

        expect(
          statusSelect
        ).toHaveValue(
          "in-progress"
        );

        expect(
          screen.getByRole(
            "button",
            {
              name:
                /save progress/i,
            }
          )
        ).toBeDefined();

        const milestoneId =
          container.querySelector(
            'input[name="milestoneId"]'
          );

        expect(
          milestoneId
        ).not.toBeNull();

        expect(
          milestoneId
        ).toHaveValue(
          "milestone-1"
        );
      }
    );
  }
);