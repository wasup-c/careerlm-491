# CareerLM

CareerLM is an AI-assisted career-development web application designed to help users identify career goals, understand skill gaps, follow personalized learning roadmaps, improve career-readiness materials, and prepare for employment opportunities.

CareerLM is being developed as a senior capstone project for CPSC 491. The project builds on design and requirements work completed during CPSC 490 and is being implemented incrementally through a series of development sprints.

## Project Overview

Traditional learning platforms often provide the same material to every learner regardless of their previous experience, career goals, available study time, or preferred learning style.

CareerLM is designed to provide a more personalized career-development experience.

The intended workflow is:

```text
User Profile and Career Goal
        ↓
Skill-Gap Analysis
        ↓
Personalized Learning Roadmap
        ↓
Learning, Assignments, and Projects
        ↓
Progress and Portfolio Development
        ↓
Résumé Improvement
        ↓
Job Matching
        ↓
Interview Preparation
```

CareerLM is not intended to train a language model from scratch. AI-assisted features will use application services and an existing language-model provider when those integrations are introduced.

---

## Core Features

CareerLM is designed around several connected feature areas.

### Personalized Onboarding

Users provide information such as:

- Target career role
- Current experience level
- Existing skills
- Preferred learning style
- Available weekly study time

This information forms the basis for later personalization.

### Personalized Career Roadmap

CareerLM creates a structured learning roadmap containing ordered milestones.

Roadmaps may include:

- Learning objectives
- Skills to develop
- Recommended resources
- Assignments
- Practical projects
- Estimated completion time
- Progress information

During early development, roadmap behavior uses deterministic logic or mock data before being connected to AI-assisted generation.

### Progress and Portfolio

CareerLM is intended to track completed roadmap work so users can see their progress and maintain a record of accomplishments.

Portfolio information may include:

- Completed milestones
- Projects
- Assignments
- Skills developed
- Completion information
- Evidence of work

### Résumé Analysis

CareerLM is intended to allow users to submit résumé information and receive structured career-readiness feedback.

The résumé workflow may include:

- Input validation
- Safe résumé submission
- Text extraction and normalization
- Strength identification
- Weakness identification
- Missing-section detection
- Career-specific suggestions
- Saved analysis results
- Resubmission

Development and demonstrations should use synthetic résumé information rather than private personal data.

### Job Search and Matching

CareerLM is intended to compare user information with job opportunities.

Matching may consider:

- Target role
- Existing skills
- Résumé information
- Portfolio information
- Completed roadmap milestones
- Experience level
- User preferences

Initial implementations may use realistic seeded job data so that CareerLM does not depend on the availability of an external job provider.

### Mock Interview Practice

CareerLM also plans to provide interview-practice functionality.

Possible capabilities include:

- Role-specific interview questions
- User responses
- Question progression
- Session feedback
- Retry or restart behavior
- Interview summaries

A deterministic/local implementation may be used before introducing AI-generated interview behavior.

---

## Architecture

CareerLM follows a layered architecture intended to separate interface, business logic, and data responsibilities.

```text
┌─────────────────────────────────────┐
│         Presentation Layer          │
│                                     │
│ Pages • Forms • Components • UI     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          Application Layer          │
│                                     │
│ Validation • Services • APIs        │
│ Personalization • Business Logic    │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             Data Layer              │
│                                     │
│ Profiles • Roadmaps • Progress      │
│ Résumés • Job Data • Persistence    │
└─────────────────────────────────────┘
```

The purpose of this separation is to avoid embedding business or persistence logic directly inside user-interface components and to allow services or providers to be replaced without redesigning the entire application.

---

## Technology Stack

The current application foundation uses:

- **Language:** TypeScript
- **Framework:** Next.js
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Package Manager:** npm
- **Linting:** ESLint
- **Source Control:** Git and GitHub
- **Project Tracking:** Jira
- **Documentation:** Google Docs / Google Sheets

Additional technologies will be selected as later functionality requires them.

These may include:

- Persistence/database technology
- Authentication/session provider
- Automated testing framework
- LLM provider
- Résumé parsing tools
- Deployment platform

Provider-specific implementation details should remain behind shared application interfaces where practical.

---

## Repository Structure

The application uses the Next.js App Router and a `src`-based project structure.

```text
careerlm-491/
├── public/
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── onboarding/
│   │   ├── generating/
│   │   └── roadmap/
│   │
│   ├── components/
│   │
│   ├── data/
│   │
│   ├── lib/
│   │
│   └── types/
│
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

### Directory Responsibilities

#### `src/app`

Next.js routes, layouts, route-specific pages, and application states.

#### `src/components`

Reusable user-interface components.

Examples may include:

- Navigation
- Form controls
- Roadmap milestone cards
- Loading states
- Error states
- Job cards
- Résumé feedback components

#### `src/data`

Local fixtures, seeded information, and mock data used during development or as fallback data sources.

#### `src/lib`

Shared application utilities, services, repository adapters, validation helpers, and other non-visual application logic.

#### `src/types`

Shared TypeScript interfaces and application data contracts.

Shared types should be reused instead of independently redefining incompatible structures across features.

---

## Initial Application Routes

The first CareerLM workflow establishes these routes:

| Route | Purpose |
| --- | --- |
| `/` | CareerLM landing page |
| `/onboarding` | User career questionnaire |
| `/generating` | Roadmap-generation status |
| `/roadmap` | Personalized or mock roadmap |

Additional routes will be introduced as CareerLM expands into account, dashboard, portfolio, résumé, job-search, and interview functionality.

Route changes that affect multiple features should be agreed upon by the team before implementation.

---

## Shared Data Concepts

CareerLM uses shared TypeScript structures to maintain consistent contracts across frontend, application, and data layers.

The initial questionnaire contract includes information equivalent to:

```ts
interface QuestionnaireInput {
  targetRole: string;
  experienceLevel: string;
  existingSkills: string[];
  learningStyle: string;
  weeklyHours: number;
}
```

A roadmap contains information such as:

```ts
interface Roadmap {
  id: string;
  title: string;
  targetRole: string;
  estimatedWeeks: number;
  milestones: Milestone[];
}
```

A milestone contains information such as:

```ts
interface Milestone {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  skills: string[];
  status: string;
}
```

The actual source files in `src/types` are the authoritative implementation once those types are finalized.

---

## Getting Started

### Prerequisites

Install:

- Git
- Node.js
- npm

Confirm they are available:

```bash
git --version
node --version
npm --version
```

---

## Installation

Clone the shared repository:

```bash
git clone https://github.com/wasup-c/careerlm-491.git
```

Enter the repository:

```bash
cd careerlm-491
```

Install the dependencies recorded in `package-lock.json`:

```bash
npm ci
```

---

## Development

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Changes made during development should automatically reload through Next.js.

---

## Available Commands

### Development Server

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

### Start Production Build

After a successful build:

```bash
npm run start
```

Additional testing, migration, seed, reset, or deployment commands may be introduced as those systems are implemented.

---

## Environment Configuration

Environment-specific configuration should be stored in local environment files rather than committed directly into source control.

The repository contains:

```text
.env.example
```

as the safe template for required configuration.

Developers may create a local environment file such as:

```text
.env.local
```

when external services are introduced.

### Never Commit

Do not commit:

- API keys
- Passwords
- Authentication secrets
- Access tokens
- Database credentials
- Private keys
- Personally identifiable user information
- Real résumé data used for testing

`.env.example` should contain variable names or safe placeholders only.

When a new environment variable becomes required, add its **name** to `.env.example` without adding the secret value.

---

## Development Workflow

CareerLM uses one shared GitHub repository.

Every contributor should work from an individual branch rather than committing feature work directly to `main`.

### 1. Update Local Main

```bash
git checkout main
git pull origin main
```

### 2. Create a Feature Branch

```bash
git checkout -b <branch-name>
```

Example:

```bash
git checkout -b s2-member1-persistence
```

### 3. Implement Assigned Work

Work should correspond to an assigned Jira issue or story.

### 4. Verify the Implementation

Run the appropriate project and feature checks before submission.

At minimum, when applicable:

```bash
npm run lint
npm run build
```

Feature owners are also responsible for testing the behavior they implement.

### 5. Review Changed Files

```bash
git status
git diff
```

Do not include unrelated files in a feature commit.

### 6. Commit

Use meaningful commit messages.

Example:

```bash
git commit -m "feat: add roadmap persistence repository"
```

### 7. Push

```bash
git push -u origin <branch-name>
```

### 8. Open a Pull Request

The pull request should include:

- Jira issue or story
- Summary of implemented work
- Acceptance criteria
- Testing or verification performed
- Known limitations
- Screenshots or command output when useful

### 9. Peer Review

Every pull request must receive peer review before merge.

Reviewers should inspect:

- Acceptance criteria
- Correctness
- Readability
- Shared data contracts
- Error handling
- Testing
- Security and privacy concerns
- Secret exposure
- Known limitations

Review comments should be substantive rather than approval-only messages.

### 10. Merge

Merge only after:

- Required review approval
- Conflicts are resolved
- Required repository checks pass
- Requested corrections are addressed

---

## Testing and Quality

Testing is distributed across feature owners.

Each contributor is responsible for verifying the functionality they implement.

Test evidence should contain:

- Test description
- Expected result
- Actual result
- Pass or fail
- Defect discovered
- Resolution or known limitation

The shared automated-testing configuration is maintained as part of the project infrastructure, while feature-specific tests remain the responsibility of the relevant feature owner.

Quality checks may include:

```bash
npm run lint
npm run build
```

and, once configured:

```bash
npm test
```

Additional integration and end-to-end testing may be introduced as the application matures.

---

## Security and Privacy

CareerLM processes information that may eventually include career profiles, résumé content, account information, and user progress.

Security and privacy should therefore be considered throughout development.

Development guidelines include:

- Never commit secrets.
- Keep external API keys server-side.
- Validate untrusted input.
- Scope user-owned information to the authenticated user.
- Avoid trusting identifiers supplied directly by the browser for authorization.
- Use controlled application errors rather than exposing stack traces or internal paths.
- Validate uploaded content before processing.
- Limit accepted résumé formats and file sizes.
- Avoid unnecessarily logging résumé or profile contents.
- Use synthetic user and résumé data during development and demonstrations.
- Maintain documented fallback behavior when external services are unavailable.

Security controls will become more complete as authentication, persistence, uploads, and deployment are introduced.

---

## Accessibility and User Experience

CareerLM is designed around a clean and approachable professional interface.

The original design direction includes:

- Responsive layouts
- Clearly labeled controls
- Visible keyboard focus indicators
- Semantic HTML
- Screen-reader-compatible components
- Sufficient color contrast
- Progressive disclosure
- Card-based content
- Clear application states

The project targets **WCAG 2.1 Level AA** where practical.

---

## Development Strategy

CareerLM is implemented incrementally rather than attempting every planned feature at once.

Early versions use:

- Mock roadmap information
- Local fixtures
- Deterministic behavior
- Demo sessions
- Seeded job records
- Fallback adapters

These approaches allow the team to establish reliable interfaces before depending on databases, authentication providers, language-model APIs, file-processing tools, or external job services.

External providers should generally be introduced behind interfaces so that local fallback behavior remains possible.

---

## Planned Development Progression

The implementation is expected to progress broadly through the following areas:

### Application Foundation

- Shared repository
- Next.js and TypeScript
- Tailwind CSS
- Application routes
- Reusable UI structure
- Development workflow

### Personalized Roadmap Flow

- Onboarding questionnaire
- Input validation
- Structured questionnaire data
- Roadmap-generation service
- Ordered roadmap milestones
- Loading and failure states

### Persistence

- Questionnaire storage
- Roadmap storage
- Milestone progress
- Save and reload behavior
- Seed/reset support

### User Sessions and Profiles

- Current-user abstraction
- Protected routes
- User-owned data
- Profile retrieval and updates
- Session-aware application behavior

### Résumé Analysis

- Secure résumé submission
- Validation
- Text extraction
- Analysis
- Structured feedback
- Saving and resubmission

### Job Matching

- Job data model
- Seeded or external job data
- Filtering
- Ranking
- Match explanations
- Job result presentation

### Interview Practice

- Interview questions
- User responses
- Session behavior
- Feedback
- Completion summary

### Release and Deployment

- Environment configuration
- Build verification
- Security and privacy review
- Integration testing
- Demo-data initialization
- Deployment
- Local fallback
- Installation documentation

Detailed sprint progress is tracked through Jira and GitHub rather than duplicated in this README.

---

## Scope and Project Status

CareerLM is an active capstone-development project.

Not every feature described in this README is necessarily implemented on the current `main` branch.

The complete CareerLM specification describes the intended system, while GitHub pull requests, Jira stories, and repository releases represent actual implementation progress.

This distinction is important because features are being introduced incrementally throughout the semester.

---

## Error and Failure Handling

CareerLM should fail predictably rather than silently or through application crashes.

Features should provide controlled behavior for conditions such as:

- Missing required input
- Invalid questionnaire information
- Roadmap-generation failure
- Missing saved roadmap
- Expired or missing session
- Unsupported résumé input
- Résumé-processing failure
- Missing job results
- External-service failure
- Invalid application routes

Where practical, users should receive understandable recovery actions such as:

- Correct input
- Retry
- Return to onboarding
- Retake questionnaire
- Upload another file
- Adjust search conditions
- Return to a valid route

---

## Project Management

Development work is tracked in Jira.

Each implementation task should include, where appropriate:

- Owner
- Description
- Acceptance criteria
- Dependencies
- Estimated effort
- Actual effort
- Testing
- Fallback behavior
- Stretch work
- Pull request
- Completion status

GitHub contains implementation history, while Jira records planned versus completed work.

---

## Contribution Evidence

Because CareerLM is developed as part of CPSC 491, contributors maintain individually attributable evidence.

This may include:

- Jira stories
- Planning artifacts
- Named GitHub commits
- Individual feature branches
- Pull requests
- Peer reviews
- Tests and results
- Documentation
- Demonstrations
- ChatGPT prompts and iterations
- Evaluation of AI-generated suggestions
- Known limitations
- Actual development time

Generated suggestions should be reviewed, adapted, understood, and independently verified before being incorporated into the application.

---

## Branch and Pull Request Policy

The `main` branch represents the current shared integration state.

Feature development should occur through individual branches and pull requests.

Repository protections may require at least one approving review before merge.

Direct work on `main` should be avoided for ordinary implementation tasks.

---

## Data and Demo Policy

Development and demonstrations should use synthetic data whenever sensitive personal information would otherwise be required.

This is especially important for:

- Résumés
- User profiles
- Authentication information
- Job-search history
- Portfolio information

Real credentials or private user information should not be committed to the repository.

---

## Documentation

Project documentation is maintained across:

- This README
- Jira
- Sprint artifacts
- Technical design documents
- Test records
- Pull requests
- Installation/deployment documentation
- Final project report

This README provides the stable repository-level overview and development workflow.

Sprint-specific implementation details should remain in Jira, sprint artifacts, and pull requests rather than requiring the entire README to be rewritten every sprint.

---

## Contributors

CareerLM is being developed by a five-person CPSC 491 capstone team.

Individual work is identifiable through:

- GitHub commits
- Feature branches
- Pull requests
- Peer reviews
- Jira assignments

---

## License

No public software license has currently been specified for CareerLM.

Unless a license is explicitly added to the repository, the project should not be assumed to grant permission for external reuse, modification, or redistribution.