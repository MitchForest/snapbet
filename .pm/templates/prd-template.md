# Product Requirements Document (PRD) Template

## Project Planning Process

### How to Use This Template

1. **Start a new chat** in Claude.ai browser with this template attached
2. **Describe your idea** at a high level
3. **Collaborative refinement** - Claude will:
   - Ask clarifying questions about your vision
   - Discuss architectural options with pros/cons
   - Identify potential gaps or challenges
   - Suggest features for MVP vs future releases
   - Recommend technology choices with rationale
   - Help structure the repository and data models
   - Define clear boundaries (what's in/out of scope)

4. **Iterative discussion** until we have:
   - Clear understanding of the MVP
   - Agreed upon architecture
   - Defined features and non-features
   - Technology stack decisions
   - Epic breakdown

5. **Final PRD creation** - Claude will generate the complete PRD below

### Key Discussion Points to Cover

- **Core Problem**: What problem are we solving?
- **Target Users**: Who will use this?
- **User Stories**: What are the 4-7 key user journeys?
- **MVP Scope**: What's the minimum to validate the idea?
- **Story-Feature Mapping**: Which features enable which user stories?
- **Architecture**: Client/server split, API design, data flow
- **Tech Stack**: Frontend, backend, database, hosting
- **Repository Structure**: How to organize the codebase
- **Data Models**: Entities, relationships, schemas
- **UI/UX Approach**: Design system, component library
- **Performance Requirements**: Speed, scale, reliability needs
- **Security Considerations**: Auth, data protection
- **Integration Points**: Third-party services, APIs

---

## [Project Name] PRD

### Project Overview

**Vision**: [One sentence describing what this project will achieve]

**Problem Statement**: [2-3 sentences describing the problem being solved]

**Success Criteria**: [How will we know this MVP is successful?]

### User Stories

#### Story 1: [Story Name]
**As a** [type of user]  
**I want to** [action/goal]  
**So that** [benefit/value]

#### Story 2: [Story Name]
**As a** [type of user]  
**I want to** [action/goal]  
**So that** [benefit/value]

#### Story 3: [Story Name]
**As a** [type of user]  
**I want to** [action/goal]  
**So that** [benefit/value]

#### Story 4: [Story Name]
**As a** [type of user]  
**I want to** [action/goal]  
**So that** [benefit/value]

[Add more stories as needed, typically 4-7 total]

### User Story to Feature Mapping

| User Story | Required Features | Epic |
|------------|------------------|------|
| Story 1 | - Feature A<br>- Feature B | Epic 1 |
| Story 2 | - Feature C<br>- Feature D | Epic 1, 2 |
| Story 3 | - Feature E | Epic 2 |
| Story 4 | - Feature F<br>- Feature G | Epic 3 |

### Technical Architecture

#### High-Level Architecture
[Describe overall system design, client-server split, major components]

#### Technology Stack
- **Frontend**: [Framework and key libraries]
- **Backend**: [Language, framework, key libraries]
- **Database**: [Type and specific technology]
- **Authentication**: [Strategy and implementation]
- **Hosting**: [Where each component will be deployed]
- **Additional Services**: [Any third-party integrations]

#### Repository Structure
```
project-root/
├── [Proposed directory structure]
└── [With explanations]
```

### API Specifications

#### Endpoints Overview
[List all API endpoints with method, path, and purpose]

#### Authentication Strategy
[How API authentication works]

#### Error Handling
[Standard error response format]

### Data Models

#### Entities
[Define each data entity with fields and types]

#### Relationships
[Describe how entities relate to each other]

#### Database Schema
```
[Provide explicit schema definitions]
```

### UI/UX Design System

#### Design Principles
[Core principles guiding UI decisions]

#### Component Library
[Key reusable components needed]

#### Responsive Strategy
[How the app adapts to different screen sizes]

#### Visual Design
[Color scheme, typography, spacing system]

### Features to Include (MVP)

*Note: Each feature should map back to one or more user stories*

#### Epic 1: [Epic Name]
- **Goal**: [What this epic achieves]
- **User Stories Addressed**: [Story 1, Story 2]
- **Features**:
  - [Feature 1] - *Enables [which part of which story]*
  - [Feature 2] - *Enables [which part of which story]*
  - [...]

#### Epic 2: [Epic Name]
- **Goal**: [What this epic achieves]
- **User Stories Addressed**: [Story 2, Story 3]
- **Features**:
  - [Feature 1] - *Enables [which part of which story]*
  - [Feature 2] - *Enables [which part of which story]*
  - [...]

[Continue for all MVP epics]

### Features to Exclude (Post-MVP)

#### Future Enhancements
- [Feature/Epic for later]
- [Feature/Epic for later]
- [...]

#### Explicitly Out of Scope
- [Things we won't build even later]
- [Boundaries and non-goals]

### Development Approach

#### Coding Standards
- [Key principles for code quality]
- [Patterns to follow]

#### Testing Strategy
- [Level of testing for MVP]
- [What we will/won't test]

#### Documentation Requirements
- [What needs documentation]
- [Documentation standards]

### Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk description] | [High/Medium/Low] | [How we'll address it] |

### Open Questions

[Any remaining questions to resolve during implementation]

### Appendix

[Any additional technical details, diagrams, or references]

---

*This PRD is a living document. It will be updated as decisions are made during implementation. All significant changes should be documented and approved.*