import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    DEFAULT_JOB_RESULT_LIMIT,
    JobValidationError,
    MAX_JOB_QUERY_LENGTH,
    MAX_JOB_RESULT_LIMIT,
    normalizeJobOpportunity,
    normalizeJobSearchQuery,
  } from "./index";
  
  describe(
    "normalizeJobSearchQuery",
    () => {
      it(
        "normalizes a valid CareerLM job search query",
        () => {
          const result =
            normalizeJobSearchQuery({
              keywords:
                "  Software Engineer  ",
  
              location:
                "  Los Angeles, CA  ",
  
              workplaceTypes: [
                "remote",
                "hybrid",
                "remote",
              ],
  
              employmentTypes: [
                "full-time",
              ],
  
              experienceLevels: [
                "entry",
                "mid",
              ],
  
              limit: 25,
            });
  
          expect(
            result
          ).toEqual({
            keywords:
              "Software Engineer",
  
            location:
              "Los Angeles, CA",
  
            workplaceTypes: [
              "remote",
              "hybrid",
            ],
  
            employmentTypes: [
              "full-time",
            ],
  
            experienceLevels: [
              "entry",
              "mid",
            ],
  
            limit: 25,
          });
        }
      );
  
      it(
        "uses safe defaults for optional filters",
        () => {
          const result =
            normalizeJobSearchQuery({
              keywords:
                "Security Analyst",
            });
  
          expect(
            result
          ).toEqual({
            keywords:
              "Security Analyst",
  
            workplaceTypes: [],
  
            employmentTypes: [],
  
            experienceLevels: [],
  
            limit:
              DEFAULT_JOB_RESULT_LIMIT,
          });
        }
      );
  
      it(
        "rejects blank keywords",
        () => {
          expect(() =>
            normalizeJobSearchQuery(
              {
                keywords:
                  "   ",
              }
            )
          ).toThrow(
            JobValidationError
          );
        }
      );
  
      it(
        "rejects excessively long search keywords",
        () => {
          expect(() =>
            normalizeJobSearchQuery(
              {
                keywords:
                  "x".repeat(
                    MAX_JOB_QUERY_LENGTH +
                      1
                  ),
              }
            )
          ).toThrow(
            `Job search keywords cannot exceed ${MAX_JOB_QUERY_LENGTH} characters.`
          );
        }
      );
  
      it(
        "rejects unsupported workplace filters",
        () => {
          expect(() =>
            normalizeJobSearchQuery(
              {
                keywords:
                  "Software Engineer",
  
                workplaceTypes: [
                  "space-station",
                ],
              }
            )
          ).toThrow(
            JobValidationError
          );
        }
      );
  
      it(
        "rejects invalid result limits",
        () => {
          expect(() =>
            normalizeJobSearchQuery(
              {
                keywords:
                  "Software Engineer",
  
                limit:
                  MAX_JOB_RESULT_LIMIT +
                  1,
              }
            )
          ).toThrow(
            JobValidationError
          );
  
          expect(() =>
            normalizeJobSearchQuery(
              {
                keywords:
                  "Software Engineer",
  
                limit: 1.5,
              }
            )
          ).toThrow(
            JobValidationError
          );
        }
      );
    }
  );
  
  describe(
    "normalizeJobOpportunity",
    () => {
      it(
        "normalizes a representative provider-independent job record",
        () => {
          const result =
            normalizeJobOpportunity({
              providerJobId:
                "  job-123  ",
  
              title:
                "  Software Engineer  ",
  
              company:
                "  Example Corp  ",
  
              location:
                "  Los Angeles, CA  ",
  
              workplaceType:
                "hybrid",
  
              description:
                "  Build and maintain CareerLM-style applications.  ",
  
              employmentType:
                "full-time",
  
              experienceLevel:
                "entry",
  
              skills: [
                "TypeScript",
                "React",
                "TypeScript",
                "  Git  ",
                "",
              ],
  
              salary: {
                min: 80000,
  
                max: 100000,
  
                currency:
                  "usd",
  
                interval:
                  "year",
              },
  
              applicationUrl:
                "https://example.com/jobs/123",
  
              source:
                "ExampleProvider",
  
              postedAt:
                "2026-11-08T12:00:00-08:00",
  
              retrievedAt:
                "2026-11-09T10:00:00-08:00",
            });
  
          expect(
            result.providerJobId
          ).toBe(
            "job-123"
          );
  
          expect(
            result.title
          ).toBe(
            "Software Engineer"
          );
  
          expect(
            result.company
          ).toBe(
            "Example Corp"
          );
  
          expect(
            result.location
          ).toBe(
            "Los Angeles, CA"
          );
  
          expect(
            result.workplaceType
          ).toBe(
            "hybrid"
          );
  
          expect(
            result.skills
          ).toEqual([
            "TypeScript",
            "React",
            "Git",
          ]);
  
          expect(
            result.salary
          ).toEqual({
            min: 80000,
  
            max: 100000,
  
            currency:
              "USD",
  
            interval:
              "year",
          });
  
          expect(
            result.applicationUrl
          ).toBe(
            "https://example.com/jobs/123"
          );
  
          expect(
            result.postedAt
          ).toBe(
            "2026-11-08T20:00:00.000Z"
          );
  
          expect(
            result.retrievedAt
          ).toBe(
            "2026-11-09T18:00:00.000Z"
          );
        }
      );
  
      it(
        "preserves missing optional provider fields instead of fabricating values",
        () => {
          const result =
            normalizeJobOpportunity({
              providerJobId:
                "job-minimal",
  
              title:
                "Developer",
  
              company:
                "Example Company",
  
              applicationUrl:
                "https://example.com/apply",
  
              source:
                "ExampleProvider",
  
              retrievedAt:
                "2026-11-09T18:00:00.000Z",
            });
  
          expect(
            result.workplaceType
          ).toBe(
            "unspecified"
          );
  
          expect(
            result.skills
          ).toEqual([]);
  
          expect(
            result.location
          ).toBeUndefined();
  
          expect(
            result.description
          ).toBeUndefined();
  
          expect(
            result.employmentType
          ).toBeUndefined();
  
          expect(
            result.experienceLevel
          ).toBeUndefined();
  
          expect(
            result.salary
          ).toBeUndefined();
  
          expect(
            result.postedAt
          ).toBeUndefined();
        }
      );
  
      it(
        "creates a retrieval timestamp when the adapter does not provide one",
        () => {
          const before =
            Date.now();
  
          const result =
            normalizeJobOpportunity({
              providerJobId:
                "job-time",
  
              title:
                "Developer",
  
              company:
                "Example Company",
  
              applicationUrl:
                "https://example.com/apply",
  
              source:
                "ExampleProvider",
            });
  
          const after =
            Date.now();
  
          const timestamp =
            new Date(
              result.retrievedAt
            ).getTime();
  
          expect(
            timestamp
          ).toBeGreaterThanOrEqual(
            before
          );
  
          expect(
            timestamp
          ).toBeLessThanOrEqual(
            after
          );
        }
      );
  
      it(
        "rejects records missing required fields",
        () => {
          expect(() =>
            normalizeJobOpportunity(
              {
                title:
                  "Developer",
  
                company:
                  "Example Company",
  
                applicationUrl:
                  "https://example.com/apply",
  
                source:
                  "ExampleProvider",
              }
            )
          ).toThrow(
            JobValidationError
          );
        }
      );
  
      it(
        "rejects invalid application URLs",
        () => {
          expect(() =>
            normalizeJobOpportunity(
              {
                providerJobId:
                  "job-invalid-url",
  
                title:
                  "Developer",
  
                company:
                  "Example Company",
  
                applicationUrl:
                  "not-a-url",
  
                source:
                  "ExampleProvider",
              }
            )
          ).toThrow(
            JobValidationError
          );
        }
      );
  
      it(
        "rejects unsupported application URL protocols",
        () => {
          expect(() =>
            normalizeJobOpportunity(
              {
                providerJobId:
                  "job-invalid-protocol",
  
                title:
                  "Developer",
  
                company:
                  "Example Company",
  
                applicationUrl:
                  "javascript:alert(1)",
  
                source:
                  "ExampleProvider",
              }
            )
          ).toThrow(
            JobValidationError
          );
        }
      );
  
      it(
        "rejects salary ranges where minimum exceeds maximum",
        () => {
          expect(() =>
            normalizeJobOpportunity(
              {
                providerJobId:
                  "job-bad-salary",
  
                title:
                  "Developer",
  
                company:
                  "Example Company",
  
                salary: {
                  min: 120000,
  
                  max: 90000,
  
                  currency:
                    "USD",
  
                  interval:
                    "year",
                },
  
                applicationUrl:
                  "https://example.com/apply",
  
                source:
                  "ExampleProvider",
              }
            )
          ).toThrow(
            JobValidationError
          );
        }
      );
    }
  );