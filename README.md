# CareerLM

CareerLM is an AI-assisted career-development platform built as a CPSC 491 senior capstone project.

The platform is designed to connect a user's career goals, current experience, learning preferences, roadmap progress, résumé information, portfolio evidence, and future job opportunities through one persistent career-development workflow.

CareerLM builds on the requirements, architecture, UX research, use cases, and prototype created during CPSC 490.

## Project Goal

Traditional learning platforms frequently present the same curriculum to every learner regardless of:

- career goal
- existing experience
- available study time
- learning preferences
- portfolio progress
- résumé strengths and gaps

CareerLM is intended to provide a connected career-development experience in which user-owned information becomes the source of personalization across multiple features.

The intended long-term workflow is:

```text
User / Session
      |
      v
Career Profile + Onboarding
      |
      v
Personalized Career Roadmap
      |
      v
Milestone Progress + Portfolio
      |
      v
Resume Analysis
      |
      v
Job Matching
      |
      v
Interview Preparation
```

## Architecture

CareerLM follows the layered architecture established during the CPSC 490 design phase.

```text
+----------------------------------+
|       Presentation Layer         |
|                                  |
| Pages, Forms, Components, UI     |
+----------------+-----------------+
                 |
                 v
+----------------------------------+
|        Application Layer         |
|                                  |
| Services, Validation, APIs,      |
| Current User, Business Logic     |
+----------------+-----------------+
                 |
                 v
+----------------------------------+
|            Data Layer            |
|                                  |
| Profiles, Questionnaires,        |
| Roadmaps, Resumes, Persistence   |
+----------------------------------+
```

The presentation layer should not select persistence user IDs or directly manage stored application state.

User-owned data flows through `CareerDataService`, which resolves the current user through `CurrentUserProvider` and delegates storage behavior to the storage-independent `CareerRepository`.

## Current Implementation Status

The repository is no longer using its original prototype architecture as the primary runtime data model.

### Implemented

The current application includes:

- Next.js App Router application structure
- TypeScript shared contracts
- onboarding questionnaire
- client-side and server-side questionnaire validation
- roadmap generation boundary
- deterministic questionnaire-aware roadmap generation
- current-user application-service boundary
- storage-independent `CareerRepository`
- in-memory repository adapter for tests
- JSON-file persistence adapter
- profile persistence
- questionnaire persistence
- roadmap persistence
- milestone-status persistence
- persisted roadmap loading
- dashboard profile and progress loading
- real dashboard profile save action
- persisted portfolio derivation
- résumé persistence domain
- résumé normalization
- persisted résumé integrity validation
- résumé save/read/replace/delete lifecycle
- current-user résumé isolation
- JSON résumé durability testing
- automated unit, integration, security-regression, and persistence tests
- GitHub Actions CI
- required pull-request workflow and peer-review controls
- change-management and emergency-change documentation

## Deterministic Roadmap Generation

CareerLM currently includes a deterministic roadmap-generation implementation.

The generator uses questionnaire information such as:

- target role
- experience level
- preferred learning style
- weekly time commitment
- target timeline

This deterministic implementation exists behind the roadmap-generation boundary so that an LLM/provider-backed implementation can later replace it without requiring the persistence or page-level contracts to be rewritten.

The current generator should not be described as full AI skill-gap analysis.

## Planned / Incomplete Features

The following areas remain planned or incomplete:

- production authentication and account creation
- production session provider
- hosted production database
- LLM-backed skill-gap analysis
- résumé file upload
- PDF/DOCX résumé extraction
- résumé analysis and feedback generation
- résumé analysis report UI
- job-provider integration
- job ranking and explanation
- interview-practice session implementation
- production deployment

## Current User / Session Boundary

Application code depends on the `CurrentUserProvider` interface.

During local development, an explicit local identity is configured through:

```text
CAREERLM_USER_ID=
```

Example `.env.local`:

```text
CAREERLM_USER_ID=local-user
```

This is not production authentication.

It exists so local development does not silently place every user operation under a hard-coded demo identity.

A real authentication/session provider should eventually replace the configured provider behind the same interface.

Automated tests may continue using explicit synthetic current-user providers.

## Persistence

Application code should depend on `CareerRepository`, not directly on JSON files or a future database implementation.

The current persisted per-user state includes:

- profile
- questionnaire
- active roadmap
- milestone progress
- normalized résumé information

The default local JSON file is:

```text
.careerlm/data.json
```

The location can be overridden with:

```text
CAREERLM_DATA_FILE=
```

The JSON adapter uses a serialized mutation path and temporary-file rename behavior to reduce stale writes and partially written persistence files.

Persisted state is validated when loaded rather than silently repaired.

## User-Owned Data

Application-facing operations should not accept arbitrary user IDs.

Examples include:

```text
getMyProfile()
saveMyProfile()

getMyQuestionnaire()
saveMyQuestionnaire()

getMyRoadmap()
createOrReplaceMyRoadmap()
updateMyMilestoneStatus()

getMyResume()
saveMyResume()
deleteMyResume()
```

`CareerDataService` resolves ownership through `CurrentUserProvider`.

This design allows a future authentication provider to replace the current local identity provider without rewriting the persistence layer.

## Roadmap Flow

The current onboarding and roadmap flow is:

```text
/onboarding
    |
    v
POST /api/roadmap
    |
    +--> questionnaire validation
    |
    +--> save current-user questionnaire
    |
    +--> generate questionnaire-aware roadmap
    |
    +--> save/replace current-user roadmap
    |
    v
/roadmap
```

`/roadmap` reads the persisted current-user roadmap rather than browser storage or static mock data.

The legacy `/generating` route redirects to `/roadmap` because roadmap generation now occurs during the onboarding API request.

## Dashboard

`/dashboard` reads current-user state through `CareerDataService`.

The dashboard combines:

- saved profile data
- questionnaire fallback values
- persisted roadmap progress

Profile edits are saved through a server action.

The browser does not choose which persistence user owns the profile.

## Portfolio

`/portfolio` derives completed work from the current user's persisted roadmap.

Completed milestones become portfolio entries.

Updating milestone status therefore affects:

- roadmap progress
- dashboard progress
- portfolio contents

This keeps all three views synchronized against the same persisted roadmap state.

## Résumé Persistence

CareerLM currently supports the persistence portion of the résumé lifecycle.

The persisted résumé contract contains:

- normalized résumé text
- education entries
- experience entries
- skill entries
- project entries
- user ownership
- schema version
- creation timestamp
- update timestamp

Supported persistence behavior includes:

- save
- read
- replace
- delete
- user isolation
- JSON durability
- persisted-state validation

Raw PDF/DOCX parsing and résumé feedback generation are separate feature responsibilities and are not yet represented as completed functionality.

Development and automated testing must use synthetic résumé information rather than private user résumés.

## Test Fixtures and Mocks

Mock, fixture, and in-memory data may still appear in automated test files.

That is intentional when used to:

- isolate a unit under test
- create deterministic test state
- avoid real personal information
- simulate failure behavior
- test multiple users safely

Runtime pages and application composition should not silently fall back to mock business data when a real service exists.

The `InMemoryCareerRepository` remains a supported test adapter.

Synthetic current-user providers remain supported for automated tests.

## Technology Stack

Current implementation:

- TypeScript
- Next.js
- React
- Tailwind CSS
- Node.js
- npm
- Vitest
- React Testing Library
- ESLint
- Git
- GitHub
- GitHub Actions
- Jira

## Repository Structure

```text
src/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── generating/
│   ├── onboarding/
│   ├── portfolio/
│   └── roadmap/
│
├── components/
│
├── lib/
│   ├── auth/
│   ├── integration/
│   ├── persistence/
│   ├── services/
│   └── validation/
│
└── types/
```

### `src/app`

Next.js routes, server actions, route handlers, and application pages.

### `src/components`

Presentation-layer React components.

### `src/lib/auth`

Current-user abstraction and identity-provider implementations.

### `src/lib/persistence`

Persistence domain contracts, validation, repository interface, adapters, errors, and persistence tests.

### `src/lib/services`

Application-service boundaries such as `CareerDataService`.

### `src/lib/integration`

Mapping and integration helpers connecting feature contracts to persistence contracts.

### `src/types`

Shared application and presentation contracts.

## Development Setup

Clone the repository:

```bash
git clone https://github.com/wasup-c/careerlm-491.git
cd careerlm-491
```

Install exact dependencies:

```bash
npm ci
```

Create:

```text
.env.local
```

For local development, configure a local CareerLM identity:

```text
CAREERLM_USER_ID=local-user
```

Optionally configure a custom persistence file:

```text
CAREERLM_DATA_FILE=
```

Start development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification Commands

Run the full automated test suite:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

Run CI-style tests with coverage:

```bash
CI=true npm run test:ci
```

All feature pull requests should pass the applicable automated verification before merge.

## Development Workflow

Ordinary implementation work should follow:

```text
main
  |
  v
individual feature branch
  |
  v
implementation + tests
  |
  v
pull request
  |
  v
required CI
  |
  v
non-author peer review
  |
  v
merge
```

Direct pushes to protected `main` should not be used for normal feature work.

Change-management and emergency-change expectations are documented in:

```text
CHANGE_MANAGEMENT.md
```

## Security and Privacy

CareerLM handles information that can become sensitive, including career profiles and résumé content.

Development expectations include:

- never commit secrets
- never commit real credentials
- use synthetic résumé data during development and testing
- validate untrusted input
- resolve user ownership server-side
- do not authorize using browser-supplied user IDs
- use controlled errors rather than exposing internal paths or stack traces
- keep external API credentials server-side
- validate persisted state before use
- maintain user-data isolation in automated tests

## Original Project Design

CareerLM originated in CPSC 490 requirements, use-case, architecture, UX, and prototype work.

That design established:

- personalized career-roadmap generation
- persistent user progress
- profile editing
- résumé analysis
- job search and matching
- personalized learning
- layered architecture
- hub-and-spoke navigation
- progressive disclosure
- persistent state

The CPSC 490 prototype intentionally used visual placeholders and non-functional screens.

CPSC 491 implementation work replaces those prototype placeholders with application services, persistence, automated tests, integration behavior, and deployable runtime functionality.

## Known Limitations

CareerLM is still a capstone project under active development.

The most important current limitations are:

1. `CAREERLM_USER_ID` is not production authentication.
2. Roadmap generation is deterministic fallback logic, not full LLM-based skill-gap analysis.
3. Résumé parsing and feedback are not yet complete.
4. Job matching has not yet reached its final provider and ranking implementation.
5. Interview practice is still planned.
6. Local JSON persistence is not the final production database.

These limitations are documented explicitly rather than hidden behind mock runtime behavior.

## Contribution Evidence

Individual CPSC 491 contributions are documented through:

- Jira work items
- named commits
- feature branches
- pull requests
- non-author peer review
- CI results
- automated tests
- sprint artifacts
- demonstrations
- ChatGPT iteration records

## License

No public software license has currently been specified for CareerLM.