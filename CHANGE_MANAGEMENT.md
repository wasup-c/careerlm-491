# CareerLM Change Management Procedure

## 1. Purpose

This procedure defines CareerLM's change-management requirements for changes to the protected `main` branch. Its purpose is to reduce the risk that unauthorized, unreviewed, or insufficiently tested changes enter the shared codebase.

This procedure supports the CareerLM team's SOC 2-aligned change-management control mapped to CC8.1.

## 2. Normal Change Process

Normal changes to CareerLM must follow the team's established development workflow:

1. Work is performed on a branch other than `main`.
2. The change should be traceable to the applicable Jira or project work item when one exists.
3. A GitHub pull request must be opened before the change enters `main`.
4. CareerLM CI must complete successfully.
5. At least one team member other than the author must review and approve the pull request.
6. If new commits are pushed after approval, the updated change must be reviewed again when the repository ruleset invalidates the previous approval.
7. All required GitHub repository rules must be satisfied before merge.
8. Changes are merged to `main` only through the approved pull-request process.

Direct pushes and force pushes to the protected `main` branch are not part of the normal change process.

## 3. Required Automated Verification

The CareerLM CI workflow is a required status check for changes to the protected `main` branch.

Before normal merge, the required workflow must successfully complete the automated verification configured by the repository, including applicable dependency installation, linting, automated tests, and production-build verification.

A failed required CI check must be corrected before the change may proceed through the normal merge process.

## 4. Peer Review

Changes to the protected `main` branch require independent review by a team member other than the author.

Reviewers should evaluate the scope and purpose of the change and consider whether the change has been adequately tested.

When a new commit causes an existing approval to become stale, a new approval must be obtained before merge.

## 5. Bypass Restrictions

The CareerLM `main` protection ruleset currently has no configured bypass actors.

Team members must not intentionally circumvent branch protection, required CI, or peer-review requirements during normal development.

Bypass privileges should not be added solely for convenience or to avoid resolving a failed control.

## 6. Emergency Change and Control Exception Process

An emergency change is a change that must be addressed promptly because delaying the change could materially affect application security, data integrity, availability, or critical project functionality.

The normal pull-request, CI, and peer-review process should continue to be used whenever technically practical, including during urgent work.

If an exceptional circumstance requires deviation from a normal change-management requirement, the following requirements apply:

1. The reason for the exception must be documented.
2. The affected change, commit, and related work item or incident must be identifiable.
3. Authorization must be obtained from an appropriate repository administrator or designated team lead before any temporary exception or bypass capability is introduced.
4. Testing and automated verification must be completed to the maximum extent practical.
5. Any temporary bypass permission must be limited to the minimum scope and duration required and removed after the emergency is resolved.
6. The change must receive retrospective peer review as soon as practical if normal review could not be completed beforehand.
7. Any failed or skipped verification must be documented and subsequently completed when practical.
8. Evidence of the emergency change, authorization, testing, review, and resulting commit or pull request must be retained in GitHub, Jira, or the applicable project documentation.

The existence of this emergency process does not authorize individual developers to bypass repository protections on their own.

## 7. Evidence and Traceability

Change-management evidence should be retained through repository-native records whenever possible. Relevant evidence may include:

- Jira or project work-item references;
- branch and commit identifiers;
- GitHub pull requests;
- author and reviewer information;
- approval records;
- GitHub Actions results;
- CI artifacts and build metadata;
- merge records; and
- documented emergency-change or exception records.

Evidence should allow a reviewer to trace a change from its purpose and author through testing, approval, automated verification, and implementation.

## 8. Review of This Procedure

The team should review this procedure when repository protections, CI workflows, approval requirements, or development practices materially change.