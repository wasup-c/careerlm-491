# CareerLM Sprint 5 Job Provider Evaluation

## Document Information

**Sprint:** Sprint 5  
**Member:** Member 1  
**Jira:** S5-M1-02  
**Purpose:** Select the external job-data provider used by CareerLM's Sprint 5 job-search infrastructure.

---

# Decision Summary

CareerLM will use the **Jobicy Public Jobs API** as its primary Sprint 5 job-data provider.

The **Himalayas Remote Jobs API** will remain the approved fallback provider if Jobicy becomes unavailable or proves unsuitable during implementation.

Neither provider requires an account or API key for the public job-search functionality required by CareerLM.

CareerLM will not couple its domain model directly to either provider.

The provider will be accessed through the CareerLM-owned `JobProvider` interface implemented in S5-M1-03.

---

# Architecture

The selected provider must fit CareerLM's existing layered architecture:

```text
CareerLM
   |
   v
JobSearchQuery
   |
   v
JobProvider
   |
   v
Provider Adapter
   |
   v
External Job API
   |
   v
Provider Response
   |
   v
Normalization
   |
   v
JobOpportunity[]
```

External provider response structures must remain inside their provider adapter.

Application code must consume CareerLM's `JobOpportunity` and `JobSearchQuery` contracts rather than provider-specific response objects.

React pages and components must not call Jobicy or Himalayas directly.

---

# Provider 1: Jobicy Public Jobs API

## Status

**Selected Primary Sprint 5 Provider**

## Authentication

The Jobicy Public Jobs API does not require:

- an API key;
- user registration;
- an account;
- OAuth;
- phone verification.

CareerLM can send public HTTP GET requests directly from its server-side provider adapter.

An optional commercial API exists for direct employer/ATS application URLs, but CareerLM does not require that functionality for Sprint 5.

---

# Public Endpoint

CareerLM will use:

```text
GET https://jobicy.com/api/jobs
```

Supported public filters include:

- `count`
- `geo`
- `industry`
- `tag`
- `cursor`

The public endpoint supports cursor-based pagination.

---

# Search Parameters

## count

Controls the maximum number of job listings returned on one page.

Jobicy currently allows:

```text
1-100
```

CareerLM will continue enforcing its own lower result limit through `JobSearchQuery`.

The provider's larger maximum will not override CareerLM's internal safety limit.

## geo

Filters listings by geographic eligibility.

Examples include:

```text
usa
europe
apac
canada
```

Sprint 5 will primarily use:

```text
usa
```

when the user's search context indicates United States opportunities.

## industry

Filters by a Jobicy category.

Examples include categories such as:

```text
engineering
data-science
marketing
supporting
```

CareerLM should not permanently hard-code Jobicy category values into its domain contracts.

Provider-specific category mapping belongs inside the Jobicy adapter.

## tag

Performs keyword matching against job titles.

CareerLM's:

```text
JobSearchQuery.keywords
```

will initially map to Jobicy's `tag` parameter.

## cursor

Used for pagination.

CareerLM Sprint 5 does not require full feed traversal.

The initial adapter should return only the controlled number of results requested by CareerLM.

---

# Jobicy Response Data

The Jobicy public response contains a `jobs` array and pagination information.

Job data may include information such as:

- provider listing ID;
- job title;
- employer/company;
- geographic eligibility;
- job description;
- employment type;
- publication date;
- salary information when available;
- Jobicy listing URL.

These values will be normalized into CareerLM's provider-independent `JobOpportunity` contract.

---

# CareerLM Jobicy Mapping

Initial mapping will follow this general structure:

| Jobicy | CareerLM |
|---|---|
| listing `id` | `providerJobId` |
| job title | `title` |
| employer/company | `company` |
| geographic/location data | `location` |
| job description | `description` |
| recognized employment type | `employmentType` |
| listing URL | `applicationUrl` |
| publication timestamp | `postedAt` |
| salary fields when safely parseable | `salary` |
| provider identity | `source = "Jobicy"` |

Fields unavailable from Jobicy remain absent or use CareerLM's explicit `unspecified` value where the CareerLM contract defines one.

CareerLM must not fabricate:

- salary values;
- experience levels;
- workplace types;
- skills;
- location details.

---

# Application URL Decision

The public Jobicy API returns a Jobicy listing URL.

CareerLM will preserve that URL in:

```text
JobOpportunity.applicationUrl
```

for the free Sprint 5 integration.

CareerLM will not attempt to scrape the listing page to discover a direct employer application URL.

A commercial Jobicy API exists for original ATS application URLs, but that feature is outside Sprint 5 scope.

---

# Storage and Retention Decision

Jobicy currently allows job data to be:

- stored;
- cached;
- processed;
- redistributed.

It does not impose a specific data-retention duration for public listings.

However, CareerLM will still avoid building a permanent raw-job warehouse during Sprint 5.

The initial architecture will treat live job results as transient search data.

CareerLM will persist:

```text
jobPreferences
```

as user-owned state.

Raw provider payloads will not be stored in `PersistenceState`.

Reasons:

- live listings change frequently;
- expired jobs should not remain active indefinitely;
- provider-specific structures should remain outside CareerLM persistence;
- Sprint 5 requires search and matching infrastructure rather than a job-listing database.

A future saved-job feature should use a separate provider-independent saved-job contract.

---

# Listing Freshness

The Jobicy public jobs feed currently contains recent listings within a limited publication window.

CareerLM should therefore treat provider results as current search results rather than permanent records.

The provider adapter should not assume that a listing disappearing from the public feed necessarily means the job immediately closed.

A later saved-job feature may use provider status checking if required.

---

# Description Security

Jobicy job descriptions may contain HTML.

CareerLM must treat provider descriptions as untrusted external content.

The provider adapter or presentation boundary must ensure that external HTML is not rendered unsafely.

Sprint 5 should prefer normalized text where possible.

If HTML rendering is introduced later, it must be sanitized before insertion into the DOM.

---

# Advantages of Jobicy

Jobicy was selected because it provides:

- real job listings;
- no account requirement;
- no phone verification;
- no API-key requirement;
- no OAuth requirement;
- direct JSON API access;
- keyword filtering;
- geographic filtering;
- category filtering;
- cursor pagination;
- job descriptions;
- employer information;
- salary information when available;
- employment information;
- public listing URLs;
- storage and caching permission;
- simple server-side integration.

It also avoids introducing credential-management complexity during a time-limited capstone sprint.

---

# Limitations of Jobicy

The Sprint 5 implementation must account for the following limitations:

- public listings focus on remote opportunities;
- public API URLs point to Jobicy listings rather than always providing the original employer ATS URL;
- not every CareerLM search filter maps directly to Jobicy;
- explicit skills may not be available as structured data;
- explicit experience level may not always be available;
- salary data may be absent;
- external descriptions may contain HTML;
- CareerLM's job domain is intentionally broader than this provider's capabilities.

These limitations must remain isolated inside the provider adapter.

They must not force provider-specific changes into the core CareerLM domain.

---

# Provider 2: Himalayas Remote Jobs API

## Status

**Approved Fallback Provider**

## Authentication

The Himalayas Remote Jobs API also supports public requests without:

- API keys;
- registration;
- OAuth.

Optional free API keys are available for increased rate limits, but CareerLM does not require them for its fallback architecture.

---

# Himalayas Search Capabilities

The Himalayas API supports job searching by criteria including:

- keyword;
- country;
- seniority;
- employment type;
- company;
- timezone;
- worldwide eligibility.

This makes it a strong secondary provider if Jobicy becomes unsuitable.

---

# Himalayas Advantages

- no authentication required;
- structured JSON API;
- keyword searching;
- country filtering;
- seniority filtering;
- employment-type filtering;
- salary information;
- application links;
- remote job listings;
- documented API behavior;
- OpenAPI specification;
- straightforward server-side usage.

---

# Himalayas Limitations

Himalayas requires visible source attribution when displaying its listings.

Its API is also focused specifically on remote opportunities.

CareerLM would need to:

- retain the required application link;
- display Himalayas attribution;
- remove expired jobs;
- obey provider rate-limit behavior.

Because CareerLM only needs one primary provider in Sprint 5, Himalayas will remain a fallback rather than adding a second adapter immediately.

---

# Provider Comparison

| Requirement | Jobicy | Himalayas |
|---|---|---|
| Real job listings | Yes | Yes |
| Public REST/JSON API | Yes | Yes |
| Account required | No | No |
| Phone verification | No | No |
| API key required | No | No |
| Keyword search | Yes | Yes |
| Geographic filtering | Yes | Yes |
| Employment information | Yes | Yes |
| Salary information | When available | Yes when available |
| Remote opportunities | Yes | Yes |
| Pagination | Cursor | Page/cursor depending on endpoint |
| Direct provider integration | Simple | Simple |
| Provider attribution requirements | Retain Jobicy listing/apply path | Visible Himalayas attribution |
| Primary Sprint 5 role | PRIMARY | FALLBACK |

---

# Selected Provider

CareerLM Sprint 5 will implement:

```text
JobicyJobProvider
```

behind:

```text
JobProvider
```

The architecture will be:

```text
CareerDataService
       |
       v
JobProvider
       |
       v
JobicyJobProvider
       |
       v
Jobicy Public Jobs API
```

No page or React component should reference Jobicy directly.

---

# Environment Configuration

The Jobicy public API requires no credentials.

Therefore S5-M1-03 does not require:

```text
JOBICY_API_KEY
```

or any other provider secret for the public implementation.

No provider secret will be added to `.env.local` for Jobicy.

If CareerLM later adopts Jobicy's optional commercial API, authentication configuration should be introduced as a separate change.

---

# Provider Request Policy

Even though Jobicy does not currently require authentication, CareerLM should still minimize unnecessary provider traffic.

Rules:

1. Automated unit tests must never call the live provider.
2. CI must never depend on external Jobicy availability.
3. Provider tests must use deterministic mocked HTTP responses.
4. Live requests should be used only for manual integration verification.
5. Search requests should originate from intentional CareerLM job searches.
6. Provider results should not automatically refresh on every unrelated page render.
7. CareerLM should enforce its own maximum result limit.
8. HTTP 429 responses must be handled as provider rate-limit failures.

---

# Search Mapping

CareerLM owns:

```text
JobSearchQuery
```

The initial Jobicy adapter will map:

| CareerLM | Jobicy |
|---|---|
| `keywords` | `tag` |
| United States location/context | `geo=usa` |
| `limit` | `count` |
| provider-supported category mapping | `industry` when applicable |

The following CareerLM concepts may not map directly:

- workplace type;
- experience level;
- all employment types;
- arbitrary city-level location.

Those fields remain part of the CareerLM domain because they may be used:

- by CareerLM matching logic;
- by future providers;
- by provider-independent application logic.

---

# Security Requirements

The Jobicy provider adapter must:

- execute server-side;
- validate CareerLM queries before external requests;
- use HTTPS;
- enforce request timeout behavior;
- validate provider HTTP status;
- reject malformed JSON;
- validate provider response structure;
- normalize results through `normalizeJobOpportunity`;
- never pass raw provider payloads directly to React components;
- safely handle HTML descriptions;
- not expose internal provider error details unnecessarily.

---

# Testing Strategy

Automated tests must not rely on live Jobicy availability.

S5-M1-03 provider tests will simulate:

- successful results;
- empty results;
- missing optional provider fields;
- malformed provider objects;
- HTTP errors;
- HTTP 429 rate limits;
- timeouts;
- network failures;
- invalid JSON;
- unsafe or invalid application URLs.

A small number of manual public API requests will verify the real integration.

---

# Manual Smoke Test

The public provider can be verified without authentication.

Example request:

```bash
curl -sS \
  "https://jobicy.com/api/jobs?count=2&geo=usa&tag=developer"
```

For formatted JSON on systems with Python 3:

```bash
curl -sS \
  "https://jobicy.com/api/jobs?count=2&geo=usa&tag=developer" \
  | python3 -m json.tool
```

No credentials should be included in this request.

---

# Decision Risks

## Risk 1: Remote-Only Dataset

**Risk:** Jobicy primarily provides remote opportunities.

**Mitigation:** CareerLM's `JobProvider` abstraction allows another provider to be added later without replacing the job domain.

---

## Risk 2: Missing CareerLM Fields

**Risk:** Jobicy may not return structured experience, skill, or workplace-type information for every listing.

**Mitigation:** Those fields remain optional. CareerLM will never fabricate missing data.

---

## Risk 3: External HTML

**Risk:** Job descriptions may contain provider-controlled HTML.

**Mitigation:** Treat all description content as untrusted and sanitize it before any future HTML rendering.

---

## Risk 4: Provider Availability

**Risk:** External API availability or terms may change.

**Mitigation:** CareerLM depends on `JobProvider`, not Jobicy directly. Himalayas is the approved fallback provider.

---

## Risk 5: Job Freshness

**Risk:** Listings change or expire.

**Mitigation:** Treat provider opportunities as transient search results rather than permanent CareerLM data.

---

# Final Decision

CareerLM Sprint 5 will use:

```text
Primary Provider:
Jobicy Public Jobs API

Fallback Provider:
Himalayas Remote Jobs API
```

This decision provides CareerLM with real job data without requiring:

- account registration;
- phone verification;
- API credentials;
- provider secrets.

It preserves the provider-independent architecture established by S5-M1-01.

The next implementation ticket, S5-M1-03, will create:

```text
JobProvider
JobicyJobProvider
provider errors
response normalization
provider tests
```

No external provider should be referenced directly by CareerLM presentation components.