# process.md - Development Process and Ceremonies

## Role Responsibilities

**Reviewer (R)** handles:
- Epic Start - Creates epic breakdown from PRD
- Sprint End - Runs quality checks (lint, typecheck, build)
- Sprint Review - Reviews code and approves/requests revisions
- Epic End - Comprehensive testing and documentation

**Executor (E)** handles:
- Sprint Start - Creates detailed implementation plan
- Sprint Execution - Implements approved plan
- Sprint Handoff - Updates tracker and prepares for review

## Process Overview

1. **Project Planning** (Claude.ai browser) → Creates PRD
2. **Epic Start** (Reviewer) → Validates plan, creates epic breakdown
3. **Sprint 0** → Sets up infrastructure
4. **Sprint Cycles**:
   - Sprint Start (Executor) → Plan implementation
   - Execute (Executor) → Build features
   - Sprint End (Reviewer) → Quality checks
   - Review (Reviewer) → Approve/revise
5. **Epic End** (Reviewer) → Refactor, document, finalize

## Detailed Process Flows

### 1. Epic Start Process (Reviewer)

**Context Required**: PRD, project-tracker.md, previous epics

**Steps**:
1. Review PRD thoroughly
2. Review any previous epics in project-tracker.md
3. Validate epic plan still makes sense
4. Identify gaps or needed clarifications
5. Ask clarifying questions
6. Suggest improvements if applicable
7. Define what's included/excluded in epic
8. Break down into sprints:
   - Sprint 0: Infrastructure setup
   - Sprints 1-N: Feature implementation (typically 3-6 features)
9. Create epic-tracker-[epic-name].md
10. Get explicit approval before proceeding

**Communication Pattern**:
```
I've reviewed the PRD and previous work. Here's my analysis:

Epic Objectives:
- [List from PRD]

Proposed Sprint Breakdown:
- Sprint 0: [Infrastructure items]
- Sprint 1: [Feature]
- Sprint 2: [Feature]
...

Questions/Concerns:
1. [Clarification needed]
2. [Potential issue]

Recommendations:
- [Suggested approach]

May I proceed with this epic plan?
```

### 2. Sprint Start Process (Executor)

**Context Required**: Current epic tracker, previous sprint trackers in epic, codebase

**Steps**:
1. Review current epic tracker
2. Review completed sprints in current epic
3. Deep dive codebase for current sprint scope
4. Identify exact files to create/modify
5. Create detailed implementation plan
6. Document in sprint-tracker-[sprint-name].md
7. Get explicit approval

**Sprint Plan Template**:
```
Sprint Objectives:
- [Clear feature/component to build]

Files to Create:
- [Exact path and purpose]

Files to Modify:
- [Exact path and what changes]

Implementation Approach:
- [Technical approach]
- [Key decisions]

Dependencies/Risks:
- [External dependencies]
- [Potential blockers]

May I proceed with this implementation plan?
```

### 3. Sprint End Process (Reviewer)

**Steps**:
1. Run linting: `bun run lint`
2. Run type checking: `bun run typecheck`
3. Run build: `bun run build` (if applicable)
4. Fix any errors related to current sprint
5. Update the existing sprint tracker file with handoff section
6. Change status to: "READY FOR REVIEW"

**Handoff Summary Template**:
```
## Handoff to Reviewer

### What Was Implemented
- [Summary of completed work]

### Files Modified/Created
- [Complete list with paths]

### Key Decisions Made
- [Any important implementation choices]

### Deviations from Plan
- [Any approved changes with reasoning]

### Known Issues/Concerns
- [Anything reviewer should pay attention to]

Status: READY FOR REVIEW
```

### 4. Sprint Review Process (Reviewer)

**Context Required**: Sprint tracker with handoff, epic tracker, PRD, actual code files

**Steps**:
1. Read sprint tracker and handoff summary
2. Review actual code changes
3. Validate against requirements
4. Add review feedback to the same sprint tracker file
5. Update status in sprint tracker: APPROVED or NEEDS REVISION
6. Update sprint status in epic tracker

**Review Section Template** (add to sprint tracker):
```
## Review Outcome

**Status**: APPROVED/NEEDS REVISION
**Reviewed**: [Date/Time]
**Reviewer Notes**: 
- [Feedback points]
```

**If Revisions Needed**: Executor addresses feedback, updates code, updates tracker, resubmits

### 5. Epic End Process (Reviewer)

**After all sprints approved**:

**Steps**:
1. Comprehensive testing of epic functionality
2. Identify refactoring opportunities within epic scope
3. Implement approved refactoring
4. Update documentation
5. Review all bugs found during epic:
   - Ensure CRITICAL/HIGH are resolved
   - Document MEDIUM/LOW in project tracker
6. Update epic tracker with summary
7. Update project-tracker.md with:
   - Epic summary
   - New bugs for bug tracker
   - New features for backlog
   - Updated user story status

**Epic Summary Template**:
```
## Epic Summary

### Completed Features
- [List all implemented features]

### Key Architectural Decisions
- [Important patterns established]
- [Technology choices made]

### Important Learnings
- [What worked well]
- [What was challenging]

### Gotchas/Notes for Future
- [Anything that might trip up future development]

### Refactoring Completed
- [What was cleaned up]

### Bugs Discovered
- [Any bugs found - add to project tracker bug list]

### Features Identified for Backlog
- [Any features discovered during implementation]
```

## File Naming Conventions

- PRD: `prd.md`
- Project tracker: `project-tracker.md`
- Epic trackers: `epic-[number]-[name]-tracker.md`
- Sprint trackers: `sprint-[epic].[sprint]-[name].md`

Examples:
- `epic-01-auth-tracker.md`
- `sprint-01.00-infrastructure.md`
- `sprint-01.01-api-setup.md`

## Context Management Rules

### For Epic Start (Reviewer)
Include: PRD, project-tracker.md, this process.md, reviewer.md

### For Sprint Start (Executor)
Include: Current epic tracker, previous sprints in epic, this process.md, executor.md

### For Sprint Execution (Executor)
Include: Current sprint tracker, executor.md only

### For Sprint End (Reviewer)
Include: Sprint tracker, this process.md, reviewer.md

### For Sprint Review (Reviewer)
Include: Sprint tracker, epic tracker, PRD, reviewer.md only

### For Epic End (Reviewer)
Include: All sprint trackers from epic, epic tracker, project-tracker.md, this process.md, reviewer.md

## Error Recovery

When blocked by technical issues:
1. Document attempted solutions in sprint tracker
2. Mark status as "BLOCKED: [description]"
3. Propose alternatives
4. Wait for user guidance
5. Update plan based on decision

## Bug Handling Process

### When Bugs Are Found

**During Sprint Execution**:
1. Document in current sprint tracker under "Known Issues"
2. If CRITICAL: Stop and fix immediately
3. If HIGH: Plan to fix in next sprint of current epic
4. If MEDIUM/LOW: Add to project tracker bug list for future

**During Sprint Review**:
1. Reviewer documents bugs in review feedback
2. CRITICAL/HIGH bugs must be fixed before approval
3. MEDIUM/LOW bugs added to project tracker

**During Epic End**:
1. All CRITICAL/HIGH bugs in epic must be resolved
2. MEDIUM/LOW bugs documented in project tracker
3. Include bug summary in epic summary

### Backlog Management

**When to Add to Backlog**:
- During planning: Features explicitly out of MVP scope
- During implementation: Good ideas that arise but aren't in plan
- During review: Suggested enhancements beyond current scope
- From bugs: Feature requests disguised as bug reports

**How to Add**:
1. Document in sprint/epic tracker when identified
2. During epic end, add to project tracker backlog
3. Assign priority (P0-P3)
4. Link to user story if applicable

## Remember

- Process ceremonies require process.md in context
- Normal execution only needs persona file (executor.md or reviewer.md)
- Every deviation must be documented
- Communication should be clear and structured
- Always wait for explicit approval at decision points