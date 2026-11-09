// @vitest-environment node

import {
    describe,
    expect,
    it,
    vi,
  } from "vitest";
  
  import type {
    JobSearchQuery,
  } from "./domain";
  
  import {
    JobProviderMalformedResponseError,
    JobProviderRateLimitError,
    JobProviderTimeoutError,
    JobProviderUnavailableError,
  } from "./provider-errors";
  
  import {
    JobicyJobProvider,
  } from "./jobicy-job-provider";
  
  function createQuery(
    overrides:
      Partial<JobSearchQuery> = {}
  ): JobSearchQuery {
    return {
      keywords:
        "Software Engineer",
  
      workplaceTypes: [],
  
      employmentTypes: [],
  
      experienceLevels: [],
  
      limit: 2,
  
      ...overrides,
    };
  }
  
  function createJobicyResponse(
    jobs: unknown[]
  ): Record<string, unknown> {
    return {
      apiVersion:
        "2.2.19",
  
      jobCount:
        jobs.length,
  
      nextCursor:
        null,
  
      hasMore:
        false,
  
      jobs,
  
      statusCode:
        200,
  
      success:
        true,
    };
  }
  
  function jsonResponse(
    body: unknown,
    status = 200
  ): Response {
    return new Response(
      JSON.stringify(
        body
      ),
      {
        status,
  
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
  
  describe(
    "JobicyJobProvider",
    () => {
      it(
        "builds a Jobicy request and normalizes a representative job",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([
                    {
                      id:
                        123456,
  
                      url:
                        "https://jobicy.com/jobs/software-engineer",
  
                      jobTitle:
                        "  Software Engineer  ",
  
                      companyName:
                        "  Example Corp  ",
  
                      jobIndustry: [
                        "Software Engineering",
                      ],
  
                      jobType: [
                        "Full-Time",
                      ],
  
                      jobGeo:
                        "USA",
  
                      jobLevel:
                        "Senior",
  
                      jobExcerpt:
                        "Short provider excerpt",
  
                      jobDescription:
                        "<p>Build <strong>TypeScript</strong> applications.</p><script>alert('unsafe')</script><p>Ship reliable features.</p>",
  
                      pubDate:
                        "2026-11-09T14:25:27+00:00",
  
                      salaryMin:
                        90000,
  
                      salaryMax:
                        125000,
  
                      salaryCurrency:
                        "usd",
  
                      salaryPeriod:
                        "yearly",
                    },
                  ])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
  
              now:
                () =>
                  new Date(
                    "2026-11-09T18:00:00.000Z"
                  ),
            });
  
          const result =
            await provider
              .searchJobs(
                createQuery({
                  location:
                    "Los Angeles, CA",
                })
              );
  
          expect(
            fetchMock
          ).toHaveBeenCalledTimes(
            1
          );
  
          const requestInput =
            fetchMock.mock
              .calls[0][0];
  
          const requestUrl =
            new URL(
              String(
                requestInput
              )
            );
  
          expect(
            requestUrl.origin +
              requestUrl.pathname
          ).toBe(
            "https://jobicy.com/api/jobs"
          );
  
          expect(
            requestUrl
              .searchParams
              .get("count")
          ).toBe("2");
  
          expect(
            requestUrl
              .searchParams
              .get("tag")
          ).toBe(
            "Software Engineer"
          );
  
          expect(
            requestUrl
              .searchParams
              .get("geo")
          ).toBe("usa");
  
          expect(
            result
          ).toHaveLength(
            1
          );
  
          expect(
            result[0]
          ).toMatchObject({
            providerJobId:
              "123456",
  
            title:
              "Software Engineer",
  
            company:
              "Example Corp",
  
            location:
              "USA",
  
            workplaceType:
              "remote",
  
            employmentType:
              "full-time",
  
            experienceLevel:
              "senior",
  
            skills: [],
  
            salary: {
              min: 90000,
  
              max: 125000,
  
              currency:
                "USD",
  
              interval:
                "year",
            },
  
            applicationUrl:
              "https://jobicy.com/jobs/software-engineer",
  
            source:
              "Jobicy",
  
            postedAt:
              "2026-11-09T14:25:27.000Z",
  
            retrievedAt:
              "2026-11-09T18:00:00.000Z",
          });
  
          expect(
            result[0]
              .description
          ).toContain(
            "Build TypeScript applications."
          );
  
          expect(
            result[0]
              .description
          ).toContain(
            "Ship reliable features."
          );
  
          expect(
            result[0]
              .description
          ).not.toContain(
            "<strong>"
          );
  
          expect(
            result[0]
              .description
          ).not.toContain(
            "<script>"
          );
  
          expect(
            result[0]
              .description
          ).not.toContain(
            "alert('unsafe')"
          );
        }
      );
  
      it(
        "preserves missing optional provider data instead of fabricating it",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([
                    {
                      id: 200,
  
                      url:
                        "https://jobicy.com/jobs/basic-developer",
  
                      jobTitle:
                        "Developer",
  
                      companyName:
                        "Example Company",
  
                      pubDate:
                        "2026-11-09T10:00:00Z",
                    },
                  ])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
  
              now:
                () =>
                  new Date(
                    "2026-11-09T18:00:00.000Z"
                  ),
            });
  
          const result =
            await provider
              .searchJobs(
                createQuery()
              );
  
          expect(
            result
          ).toHaveLength(
            1
          );
  
          expect(
            result[0]
              .providerJobId
          ).toBe("200");
  
          expect(
            result[0]
              .workplaceType
          ).toBe("remote");
  
          expect(
            result[0]
              .skills
          ).toEqual([]);
  
          expect(
            result[0]
              .location
          ).toBeUndefined();
  
          expect(
            result[0]
              .description
          ).toBeUndefined();
  
          expect(
            result[0]
              .employmentType
          ).toBeUndefined();
  
          expect(
            result[0]
              .experienceLevel
          ).toBeUndefined();
  
          expect(
            result[0]
              .salary
          ).toBeUndefined();
        }
      );
  
      it(
        "uses the provider excerpt when a full description is unavailable",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([
                    {
                      id: 201,
  
                      url:
                        "https://jobicy.com/jobs/excerpt-job",
  
                      jobTitle:
                        "Developer",
  
                      companyName:
                        "Example Company",
  
                      jobExcerpt:
                        "  Build reliable web applications.  ",
  
                      pubDate:
                        "2026-11-09T10:00:00Z",
                    },
                  ])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          const result =
            await provider
              .searchJobs(
                createQuery()
              );
  
          expect(
            result[0]
              .description
          ).toBe(
            "Build reliable web applications."
          );
        }
      );
  
      it(
        "maps broad supported locations to Jobicy geo filters",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await provider
            .searchJobs(
              createQuery({
                location:
                  "Canada",
              })
            );
  
          const requestInput =
            fetchMock.mock
              .calls[0][0];
  
          const requestUrl =
            new URL(
              String(
                requestInput
              )
            );
  
          expect(
            requestUrl
              .searchParams
              .get("geo")
          ).toBe(
            "canada"
          );
        }
      );
  
      it(
        "does not call the remote-only provider for an on-site-only search",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          const result =
            await provider
              .searchJobs(
                createQuery({
                  workplaceTypes: [
                    "on-site",
                  ],
                })
              );
  
          expect(
            result
          ).toEqual([]);
  
          expect(
            fetchMock
          ).not.toHaveBeenCalled();
        }
      );
  
      it(
        "applies employment-type filters after provider normalization",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([
                    {
                      id: 301,
  
                      url:
                        "https://jobicy.com/jobs/full-time",
  
                      jobTitle:
                        "Full-Time Developer",
  
                      companyName:
                        "Company A",
  
                      jobType: [
                        "Full-Time",
                      ],
  
                      pubDate:
                        "2026-11-09T10:00:00Z",
                    },
  
                    {
                      id: 302,
  
                      url:
                        "https://jobicy.com/jobs/contract",
  
                      jobTitle:
                        "Contract Developer",
  
                      companyName:
                        "Company B",
  
                      jobType: [
                        "Contract",
                      ],
  
                      pubDate:
                        "2026-11-09T10:00:00Z",
                    },
                  ])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          const result =
            await provider
              .searchJobs(
                createQuery({
                  employmentTypes: [
                    "contract",
                  ],
                })
              );
  
          expect(
            result
          ).toHaveLength(
            1
          );
  
          expect(
            result[0]
              .providerJobId
          ).toBe("302");
  
          expect(
            result[0]
              .employmentType
          ).toBe(
            "contract"
          );
        }
      );
  
      it(
        "returns an empty array for a valid provider response with no jobs",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).resolves.toEqual([]);
        }
      );
  
      it(
        "converts HTTP 429 into a controlled rate-limit error",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  {
                    success:
                      false,
  
                    error:
                      "Provider internal rate-limit message",
                  },
                  429
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).rejects.toBeInstanceOf(
            JobProviderRateLimitError
          );
        }
      );
  
      it(
        "converts provider HTTP failures into a controlled unavailable error",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  {
                    error:
                      "Provider internal failure",
                  },
                  500
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).rejects.toBeInstanceOf(
            JobProviderUnavailableError
          );
        }
      );
  
      it(
        "converts network failures into a controlled unavailable error",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> => {
                throw new Error(
                  "socket failure containing provider internals"
                );
              }
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          let caught:
            unknown;
  
          try {
            await provider
              .searchJobs(
                createQuery()
              );
          } catch (error) {
            caught =
              error;
          }
  
          expect(
            caught
          ).toBeInstanceOf(
            JobProviderUnavailableError
          );
  
          expect(
            caught
          ).toMatchObject({
            message:
              "Job provider is currently unavailable.",
  
            code:
              "JOB_PROVIDER_UNAVAILABLE",
          });
  
          expect(
            String(
              (
                caught as Error
              ).message
            )
          ).not.toContain(
            "socket failure"
          );
        }
      );
  
      it(
        "converts aborted requests into a controlled timeout error",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> => {
                const error =
                  new Error(
                    "aborted"
                  );
  
                error.name =
                  "AbortError";
  
                throw error;
              }
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).rejects.toBeInstanceOf(
            JobProviderTimeoutError
          );
        }
      );
  
      it(
        "rejects invalid JSON as a malformed provider response",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                new Response(
                  "not-json",
                  {
                    status:
                      200,
  
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                  }
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).rejects.toBeInstanceOf(
            JobProviderMalformedResponseError
          );
        }
      );
  
      it(
        "rejects responses without a jobs array",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse({
                  success:
                    true,
  
                  statusCode:
                    200,
  
                  jobs:
                    {},
                })
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).rejects.toBeInstanceOf(
            JobProviderMalformedResponseError
          );
        }
      );
  
      it(
        "rejects provider records with invalid required fields",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse(
                  createJobicyResponse([
                    {
                      id: 401,
  
                      url:
                        "not-a-url",
  
                      jobTitle:
                        "Developer",
  
                      companyName:
                        "Example Company",
  
                      pubDate:
                        "2026-11-09T10:00:00Z",
                    },
                  ])
                )
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).rejects.toBeInstanceOf(
            JobProviderMalformedResponseError
          );
        }
      );
  
      it(
        "converts provider-declared failures into a controlled unavailable error",
        async () => {
          const fetchMock =
            vi.fn(
              async (): Promise<Response> =>
                jsonResponse({
                  success:
                    false,
  
                  statusCode:
                    400,
  
                  error:
                    "Provider-specific error text",
                })
            );
  
          const provider =
            new JobicyJobProvider({
              fetchImpl:
                fetchMock,
            });
  
          await expect(
            provider
              .searchJobs(
                createQuery()
              )
          ).rejects.toBeInstanceOf(
            JobProviderUnavailableError
          );
        }
      );
    }
  );