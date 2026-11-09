import type {
    JobEmploymentType,
    JobExperienceLevel,
    JobOpportunity,
    JobSalaryInterval,
    JobSearchQuery,
  } from "./domain";
  
  import {
    JobValidationError,
  } from "./errors";
  
  import {
    JobProviderError,
    JobProviderMalformedResponseError,
    JobProviderRateLimitError,
    JobProviderTimeoutError,
    JobProviderUnavailableError,
  } from "./provider-errors";
  
  import type {
    JobProvider,
    JobProviderFetch,
  } from "./provider";
  
  import {
    normalizeJobOpportunity,
    normalizeJobSearchQuery,
  } from "./validation";
  
  export const JOBICY_PUBLIC_JOBS_URL =
    "https://jobicy.com/api/jobs";
  
  export const DEFAULT_JOBICY_TIMEOUT_MS =
    8_000;
  
  export const DEFAULT_JOBICY_GEO =
    "usa";
  
  export interface JobicyJobProviderOptions {
    fetchImpl?: JobProviderFetch;
  
    baseUrl?: string;
  
    timeoutMs?: number;
  
    defaultGeo?: string;
  
    now?: () => Date;
  }
  
  /**
   * Public Jobicy provider adapter.
   *
   * The adapter is responsible for:
   *
   * - translating CareerLM search queries into Jobicy query parameters;
   * - performing the external HTTP request;
   * - validating provider response structure;
   * - translating Jobicy fields into CareerLM JobOpportunity objects;
   * - converting provider failures into CareerLM-owned errors.
   *
   * No API key is required for Jobicy's public jobs endpoint.
   */
  export class JobicyJobProvider
    implements JobProvider
  {
    private readonly fetchImpl:
      JobProviderFetch;
  
    private readonly baseUrl:
      string;
  
    private readonly timeoutMs:
      number;
  
    private readonly defaultGeo:
      string;
  
    private readonly now:
      () => Date;
  
    constructor(
      options:
        JobicyJobProviderOptions = {}
    ) {
      this.fetchImpl =
        options.fetchImpl ??
        fetch;
  
      this.baseUrl =
        options.baseUrl ??
        JOBICY_PUBLIC_JOBS_URL;
  
      this.timeoutMs =
        options.timeoutMs ??
        DEFAULT_JOBICY_TIMEOUT_MS;
  
      this.defaultGeo =
        options.defaultGeo ??
        DEFAULT_JOBICY_GEO;
  
      this.now =
        options.now ??
        (() => new Date());
    }
  
    async searchJobs(
      query: JobSearchQuery
    ): Promise<JobOpportunity[]> {
      const normalizedQuery =
        normalizeJobSearchQuery(
          query
        );
  
      /*
       * Jobicy's public feed contains remote opportunities.
       *
       * When the caller explicitly requests workplace types that exclude
       * remote work, there is no reason to make an external request.
       */
      if (
        normalizedQuery
          .workplaceTypes
          .length > 0 &&
        !normalizedQuery
          .workplaceTypes
          .includes("remote")
      ) {
        return [];
      }
  
      const requestUrl =
        this.buildRequestUrl(
          normalizedQuery
        );
  
      const controller =
        new AbortController();
  
      const timeoutId =
        setTimeout(
          () => {
            controller.abort();
          },
          this.timeoutMs
        );
  
      try {
        const response =
          await this.fetchImpl(
            requestUrl,
            {
              method: "GET",
  
              headers: {
                Accept:
                  "application/json",
              },
  
              signal:
                controller.signal,
            }
          );
  
        if (
          response.status ===
          429
        ) {
          throw new JobProviderRateLimitError();
        }
  
        if (!response.ok) {
          throw new JobProviderUnavailableError();
        }
  
        let payload:
          unknown;
  
        try {
          payload =
            await response.json();
        } catch {
          throw new JobProviderMalformedResponseError();
        }
  
        const jobs =
          this.readJobs(
            payload
          );
  
        const opportunities =
          jobs.map(
            (job) =>
              this.normalizeJobicyJob(
                job
              )
          );
  
        return opportunities
          .filter(
            (opportunity) =>
              this.matchesEmploymentFilters(
                opportunity,
                normalizedQuery
              )
          )
          .filter(
            (opportunity) =>
              this.matchesExperienceFilters(
                opportunity,
                normalizedQuery
              )
          )
          .slice(
            0,
            normalizedQuery.limit
          );
      } catch (error) {
        if (
          error instanceof
          JobProviderError
        ) {
          throw error;
        }
  
        if (
          this.isAbortError(
            error
          )
        ) {
          throw new JobProviderTimeoutError();
        }
  
        throw new JobProviderUnavailableError();
      } finally {
        clearTimeout(
          timeoutId
        );
      }
    }
  
    private buildRequestUrl(
      query: JobSearchQuery
    ): URL {
      const url =
        new URL(
          this.baseUrl
        );
  
      url.searchParams.set(
        "count",
        String(
          query.limit
        )
      );
  
      url.searchParams.set(
        "tag",
        query.keywords
      );
  
      const geo =
        this.resolveGeo(
          query.location
        );
  
      if (geo) {
        url.searchParams.set(
          "geo",
          geo
        );
      }
  
      return url;
    }
  
    private resolveGeo(
      location:
        string | undefined
    ): string {
      if (!location) {
        return this.defaultGeo;
      }
  
      const normalized =
        location
          .trim()
          .toLowerCase();
  
      if (
        normalized ===
          "canada"
      ) {
        return "canada";
      }
  
      if (
        normalized ===
          "europe" ||
        normalized ===
          "eu" ||
        normalized ===
          "united kingdom" ||
        normalized ===
          "uk"
      ) {
        return "europe";
      }
  
      if (
        normalized ===
          "apac" ||
        normalized ===
          "asia pacific" ||
        normalized ===
          "asia-pacific"
      ) {
        return "apac";
      }
  
      /*
       * Sprint 5 targets United States opportunities.
       *
       * Free-form city/state locations such as "Los Angeles, CA" do not map
       * directly to Jobicy's broad geo taxonomy, so they use the configured
       * Sprint 5 default instead of leaking Jobicy taxonomy into CareerLM's
       * domain model.
       */
      return this.defaultGeo;
    }
  
    private readJobs(
      payload: unknown
    ): unknown[] {
      const data =
        this.requireRecord(
          payload
        );
  
      if (
        data.success ===
        false
      ) {
        throw new JobProviderUnavailableError();
      }
  
      if (
        !Array.isArray(
          data.jobs
        )
      ) {
        throw new JobProviderMalformedResponseError();
      }
  
      return data.jobs;
    }
  
    private normalizeJobicyJob(
      value: unknown
    ): JobOpportunity {
      const data =
        this.requireRecord(
          value
        );
  
      const description =
        this.normalizeDescription(
          data.jobDescription,
          data.jobExcerpt
        );
  
      const salary =
        this.buildSalary(
          data
        );
  
      try {
        return normalizeJobOpportunity({
          providerJobId:
            this.normalizeProviderJobId(
              data.id
            ),
  
          title:
            data.jobTitle,
  
          company:
            data.companyName,
  
          location:
            data.jobGeo,
  
          /*
           * Jobicy's selected public API is a remote-jobs feed.
           */
          workplaceType:
            "remote",
  
          description,
  
          employmentType:
            this.mapEmploymentType(
              data.jobType
            ),
  
          experienceLevel:
            this.mapExperienceLevel(
              data.jobLevel
            ),
  
          /*
           * Jobicy does not expose a reliable structured skill array in the
           * public job record used by this adapter.
           *
           * CareerLM must not fabricate skills from unstructured text here.
           */
          skills: [],
  
          salary,
  
          applicationUrl:
            data.url,
  
          source:
            "Jobicy",
  
          postedAt:
            data.pubDate,
  
          retrievedAt:
            this.now()
              .toISOString(),
        });
      } catch (error) {
        if (
          error instanceof
          JobValidationError
        ) {
          throw new JobProviderMalformedResponseError();
        }
  
        throw error;
      }
    }
  
    private normalizeProviderJobId(
      value: unknown
    ): unknown {
      if (
        typeof value ===
          "number" &&
        Number.isSafeInteger(
          value
        ) &&
        value >= 0
      ) {
        return String(
          value
        );
      }
  
      return value;
    }
  
    private normalizeDescription(
      jobDescription:
        unknown,
      jobExcerpt:
        unknown
    ): string | undefined {
      if (
        jobDescription !==
          undefined &&
        jobDescription !==
          null
      ) {
        if (
          typeof jobDescription !==
          "string"
        ) {
          throw new JobProviderMalformedResponseError();
        }
  
        const normalized =
          this.htmlToPlainText(
            jobDescription
          );
  
        return (
          normalized ||
          undefined
        );
      }
  
      if (
        jobExcerpt ===
          undefined ||
        jobExcerpt ===
          null
      ) {
        return undefined;
      }
  
      if (
        typeof jobExcerpt !==
        "string"
      ) {
        throw new JobProviderMalformedResponseError();
      }
  
      const normalized =
        jobExcerpt.trim();
  
      return (
        normalized ||
        undefined
      );
    }
  
    private htmlToPlainText(
      html: string
    ): string {
      const decoded =
        this.decodeHtmlEntities(
          html
        );
  
      return decoded
        .replace(
          /<script\b[^>]*>[\s\S]*?<\/script>/gi,
          " "
        )
        .replace(
          /<style\b[^>]*>[\s\S]*?<\/style>/gi,
          " "
        )
        .replace(
          /<br\s*\/?>/gi,
          "\n"
        )
        .replace(
          /<\/p\s*>/gi,
          "\n"
        )
        .replace(
          /<\/div\s*>/gi,
          "\n"
        )
        .replace(
          /<[^>]+>/g,
          " "
        )
        .replace(
          /[ \t]+/g,
          " "
        )
        .replace(
          / *\n */g,
          "\n"
        )
        .replace(
          /\n{3,}/g,
          "\n\n"
        )
        .trim();
    }
  
    private decodeHtmlEntities(
      value: string
    ): string {
      return value.replace(
        /&(#\d+|#x[0-9a-f]+|nbsp|amp|quot|apos|lt|gt);/gi,
        (
          entity,
          code: string
        ) => {
          const normalized =
            code.toLowerCase();
  
          const namedEntities:
            Record<
              string,
              string
            > = {
              nbsp: " ",
              amp: "&",
              quot: "\"",
              apos: "'",
              lt: "<",
              gt: ">",
            };
  
          if (
            normalized in
            namedEntities
          ) {
            return namedEntities[
              normalized
            ];
          }
  
          const numericValue =
            normalized
              .startsWith("#x")
              ? Number.parseInt(
                  normalized.slice(2),
                  16
                )
              : Number.parseInt(
                  normalized.slice(1),
                  10
                );
  
          if (
            !Number.isFinite(
              numericValue
            ) ||
            numericValue < 0 ||
            numericValue >
              0x10ffff
          ) {
            return entity;
          }
  
          try {
            return String.fromCodePoint(
              numericValue
            );
          } catch {
            return entity;
          }
        }
      );
    }
  
    private mapEmploymentType(
      value: unknown
    ):
      JobEmploymentType |
      undefined
    {
      if (
        value ===
          undefined ||
        value ===
          null
      ) {
        return undefined;
      }
  
      if (
        !Array.isArray(
          value
        )
      ) {
        throw new JobProviderMalformedResponseError();
      }
  
      for (
        const item of
        value
      ) {
        if (
          typeof item !==
          "string"
        ) {
          throw new JobProviderMalformedResponseError();
        }
  
        const normalized =
          item
            .trim()
            .toLowerCase()
            .replace(
              /[_\s]+/g,
              "-"
            );
  
        switch (
          normalized
        ) {
          case "full-time":
          case "fulltime":
            return "full-time";
  
          case "part-time":
          case "parttime":
            return "part-time";
  
          case "contract":
          case "contractor":
          case "freelance":
            return "contract";
  
          case "temporary":
          case "temp":
            return "temporary";
  
          case "internship":
          case "intern":
            return "internship";
  
          case "other":
            return "other";
  
          default:
            break;
        }
      }
  
      return undefined;
    }
  
    private mapExperienceLevel(
      value: unknown
    ):
      JobExperienceLevel |
      undefined
    {
      if (
        value ===
          undefined ||
        value ===
          null
      ) {
        return undefined;
      }
  
      if (
        typeof value !==
        "string"
      ) {
        throw new JobProviderMalformedResponseError();
      }
  
      const normalized =
        value
          .trim()
          .toLowerCase();
  
      switch (
        normalized
      ) {
        case "entry":
        case "entry level":
        case "entry-level":
        case "junior":
          return "entry";
  
        case "mid":
        case "mid level":
        case "mid-level":
        case "intermediate":
          return "mid";
  
        case "senior":
        case "senior level":
        case "senior-level":
          return "senior";
  
        case "lead":
        case "team lead":
          return "lead";
  
        case "executive":
        case "director":
        case "executive level":
        case "executive-level":
          return "executive";
  
        default:
          return undefined;
      }
    }
  
    private buildSalary(
      data:
        Record<
          string,
          unknown
        >
    ):
      Record<
        string,
        unknown
      > |
      undefined
    {
      const hasMinimum =
        data.salaryMin !==
          undefined &&
        data.salaryMin !==
          null;
  
      const hasMaximum =
        data.salaryMax !==
          undefined &&
        data.salaryMax !==
          null;
  
      if (
        !hasMinimum &&
        !hasMaximum
      ) {
        return undefined;
      }
  
      return {
        min:
          data.salaryMin,
  
        max:
          data.salaryMax,
  
        currency:
          data.salaryCurrency,
  
        interval:
          this.mapSalaryInterval(
            data.salaryPeriod
          ),
      };
    }
  
    private mapSalaryInterval(
      value: unknown
    ):
      JobSalaryInterval |
      undefined
    {
      if (
        value ===
          undefined ||
        value ===
          null
      ) {
        return undefined;
      }
  
      if (
        typeof value !==
        "string"
      ) {
        throw new JobProviderMalformedResponseError();
      }
  
      const normalized =
        value
          .trim()
          .toLowerCase();
  
      switch (
        normalized
      ) {
        case "hour":
        case "hourly":
          return "hour";
  
        case "day":
        case "daily":
          return "day";
  
        case "week":
        case "weekly":
          return "week";
  
        case "month":
        case "monthly":
          return "month";
  
        case "year":
        case "yearly":
        case "annual":
        case "annually":
          return "year";
  
        default:
          return undefined;
      }
    }
  
    private matchesEmploymentFilters(
      opportunity:
        JobOpportunity,
      query:
        JobSearchQuery
    ): boolean {
      if (
        query
          .employmentTypes
          .length === 0
      ) {
        return true;
      }
  
      if (
        !opportunity
          .employmentType
      ) {
        return false;
      }
  
      return query
        .employmentTypes
        .includes(
          opportunity
            .employmentType
        );
    }
  
    private matchesExperienceFilters(
      opportunity:
        JobOpportunity,
      query:
        JobSearchQuery
    ): boolean {
      if (
        query
          .experienceLevels
          .length === 0
      ) {
        return true;
      }
  
      if (
        !opportunity
          .experienceLevel
      ) {
        return false;
      }
  
      return query
        .experienceLevels
        .includes(
          opportunity
            .experienceLevel
        );
    }
  
    private requireRecord(
      value: unknown
    ):
      Record<
        string,
        unknown
      >
    {
      if (
        typeof value !==
          "object" ||
        value === null ||
        Array.isArray(
          value
        )
      ) {
        throw new JobProviderMalformedResponseError();
      }
  
      return value as Record<
        string,
        unknown
      >;
    }
  
    private isAbortError(
      error: unknown
    ): boolean {
      return (
        error instanceof
          Error &&
        error.name ===
          "AbortError"
      );
    }
  }