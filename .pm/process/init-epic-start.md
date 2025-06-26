# init-epic-start.md - Epic Initialization Process

## Usage
```
init epic start {epic-number}
```

## You are R (Reviewer) - Epic Planning Phase

You are initiating a new epic. Your goal is to create a comprehensive plan that balances MVP achievability with senior-level quality and maintainable architecture.

## Process Steps

### 1. Review All Planning Documentation
Read and deeply understand:
- **Epic Brief**: The high-level functionality overview for Epic {epic-number}
- `.pm/planning_docs/prd.md` - Current product requirements (takes precedence)
- `.pm/planning_docs/roadmap.md` - Product roadmap (takes precedence)
- All files in `.pm/planning_docs/old/` - Historical context (superseded by PRD/roadmap if conflicts exist)

### 2. Database Architecture Review
Use Supabase MCP to:
- Review current database structure (tables, columns, types, relationships)
- Identify what new tables/columns are needed for this epic
- Check for any schema inconsistencies or optimization opportunities
- Plan necessary migrations (don't stub - actually implement database changes)
- Ensure generated types will align with new functionality

### 3. Gap Analysis
After reviewing all documentation:
1. **Identify Knowledge Gaps**
   - Technical implementation questions
   - Product requirement clarifications
   - Architecture decisions needed
   - UI/UX uncertainties

2. **Deep Dive Investigation**
   - Explore the codebase to answer what you can
   - Review similar implementations in existing code
   - Check current patterns and conventions
   - Document your findings

3. **Compile Remaining Questions**
   - List questions you couldn't answer through investigation
   - Provide suggested answers or options for each
   - Prioritize by importance to epic success

### 4. Create Comprehensive Epic Plan

Structure your plan to include:

#### Epic Overview
- Clear statement of epic goals
- Success criteria
- Key user flows

#### MVP vs Post-MVP Analysis
For each feature/component:
- **MVP**: What must be built now (working, clean, extensible)
- **Post-MVP**: What can be deferred (note: not "hacky", just "not yet needed")
- **Simplification Opportunities**: Where we can start simple and enhance later

#### Architectural Decisions
- Database schema changes needed
- State management approach
- Component architecture
- Integration points with existing systems
- Design pattern consistency with current codebase

#### Technical Considerations
- Performance requirements
- Security considerations
- Error handling strategy
- Testing approach

#### UI/UX Requirements
- Design consistency with existing app
- Animation and interaction patterns
- Responsive behavior
- Accessibility considerations

### 5. Sprint Breakdown Planning
Create logical sprint sequence:
- Each sprint 1-4 hours of work
- Clear dependencies between sprints
- Database migrations early in sequence
- UI implementation after data layer
- Integration and polish at the end

### 6. Present Findings to User

Format your response as:
```markdown
# Epic {epic-number} Planning Analysis

## Understanding
[Summary of what this epic will achieve]

## Database Requirements
[Supabase schema changes needed]

## Architecture Approach
[How this fits into existing architecture]

## MVP Scope
[What we're building now]

## Post-MVP Deferrals
[What we're intentionally leaving for later]

## Questions Requiring Clarification
1. **[Question]**
   - Context: [Why this matters]
   - Suggested approach: [Your recommendation]
   
2. **[Next question]**
   - Context: [Why this matters]
   - Suggested approach: [Your recommendation]

## Proposed Sprint Sequence
1. Sprint {epic-number}.01: [Description] (X hours)
2. Sprint {epic-number}.02: [Description] (X hours)
[etc.]
```

## Remember
- You're planning for MVP but with senior-level quality
- Simple and working > complex and perfect
- Every decision should enable future enhancement
- Database changes are real, not stubbed
- UI/UX should be beautiful and consistent
- Architecture should follow existing patterns