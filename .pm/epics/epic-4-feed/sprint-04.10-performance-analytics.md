# Sprint 04.10: Performance Analytics Tracker

## Sprint Overview

**Sprint Number**: 04.10  
**Sprint Name**: Performance Analytics  
**Duration**: 1.5 hours  
**Status**: DEFERRED TO EPIC 5
**Dependencies**: Sprint 04.05 (Engagement Backend) - Need real bet data to analyze

**Sprint Goal**: Build comprehensive performance analytics and visualization for user profiles, completing the missing features from Epic 8.

**User Stories Addressed**:
- Story 5: The Missing My People Problem - Performance data helps find successful bettors
- Story 3: The Overthinking Problem - Visual analytics help understand betting patterns

## Implementation Plan

### Phase 1: Data Aggregation (30 min)
1. Create performance calculation functions
2. Build sport-specific queries
3. Implement bet type analysis
4. Calculate time-based patterns

### Phase 2: Analytics Components (45 min)
1. Build performance charts component
2. Create sport breakdown display
3. Implement bet type visualization
4. Add time pattern insights

### Phase 3: Integration (15 min)
1. Add analytics tab to profiles
2. Update ProfileTabs component
3. Test with mock bet data
4. Ensure responsive design

## Files to Create/Modify

| File Path | Description | Status |
|-----------|-------------|--------|
| `components/profile/PerformanceTab.tsx` | Main performance analytics display | NOT STARTED |
| `components/profile/SportBreakdown.tsx` | Sport-specific performance component | NOT STARTED |
| `components/profile/BetTypeAnalysis.tsx` | Spread/Total/ML breakdown | NOT STARTED |
| `components/profile/PerformanceChart.tsx` | Visual chart component | NOT STARTED |
| `hooks/usePerformanceStats.ts` | Performance data fetching hook | NOT STARTED |
| `services/analytics/performanceService.ts` | Analytics calculation service | NOT STARTED |
| `components/profile/ProfileTabs.tsx` | Add performance tab | MODIFY |
| `app/(drawer)/profile/[username].tsx` | Integrate performance tab | MODIFY |

## Technical Implementation

### Component Architecture
```
ProfileScreen
└── ProfileTabs (posts | bets | performance)
    └── PerformanceTab
        ├── 7-Day Summary Card
        ├── SportBreakdown
        ├── BetTypeAnalysis
        └── TimePatternInsights
```

### Data Structure
```typescript
interface PerformanceStats {
  // Overall stats
  last7Days: {
    totalBets: number;
    wins: number;
    losses: number;
    pushes: number;
    profit: number;
    roi: number;
    winRate: number;
  };
  
  // Sport breakdown
  bySport: {
    [sport: string]: {
      bets: number;
      winRate: number;
      profit: number;
      bestBetType: string;
      worstBetType: string;
    };
  };
  
  // Bet type analysis
  byBetType: {
    spread: { count: number; winRate: number; profit: number };
    total: { count: number; winRate: number; profit: number };
    moneyline: { count: number; winRate: number; profit: number };
  };
  
  // Time patterns
  patterns: {
    bestDayOfWeek: string;
    bestTimeOfDay: string;
    streakData: number[];
    profitTrend: number[];
  };
}
```

### Key Features

1. **7-Day Rolling Stats**:
   - Win/Loss/Push record
   - Total profit/loss
   - ROI percentage
   - Win rate with trend

2. **Sport Breakdown**:
   - Performance by sport (NFL, NBA, etc.)
   - Best performing sport highlighted
   - Profit/loss by sport
   - Favorite teams analysis

3. **Bet Type Analysis**:
   - Spread vs Total vs Moneyline
   - Success rate by type
   - Visual pie chart
   - Recommendations based on data

4. **Time Patterns**:
   - Best day of week
   - Prime time vs day games
   - Streak visualization
   - Profit trend line chart

### Implementation Details

```typescript
// hooks/usePerformanceStats.ts
export function usePerformanceStats(userId: string) {
  // Purpose: Fetch and calculate performance analytics
  // Returns: { stats, isLoading, error }
}

// services/analytics/performanceService.ts
export async function calculatePerformanceStats(userId: string) {
  // Complex queries to aggregate bet data
  // Sport-specific calculations
  // Time-based pattern detection
}

// components/profile/PerformanceChart.tsx
export function PerformanceChart({ data, type }) {
  // Use react-native-svg for charts
  // Line chart for profit trends
  // Bar chart for sport comparison
}
```

### Database Queries Needed

1. **7-Day Performance**:
   - Join bets with games
   - Filter by date range
   - Group by outcome

2. **Sport Analysis**:
   - Group bets by sport
   - Calculate win rates
   - Sum profits

3. **Bet Type Breakdown**:
   - Group by bet_type
   - Calculate success rates
   - Compare profitability

4. **Pattern Detection**:
   - Group by day of week
   - Group by hour of day
   - Calculate streaks

## Acceptance Criteria

- [ ] Performance tab appears in user profiles
- [ ] 7-day stats calculate correctly
- [ ] Sport breakdown shows all sports bet on
- [ ] Bet type analysis displays visually
- [ ] Charts render smoothly at 60 FPS
- [ ] Empty states for users with no bets
- [ ] Loading states during calculation
- [ ] Error handling for failed queries

## Testing Scenarios

- User with no bets: Show encouraging empty state
- User with 1 sport only: Focus on bet types
- User with diverse betting: Full analytics
- Performance with 1000+ bets: Ensure fast queries
- Offline mode: Show cached data

## Error Handling

- Database query failures: Show last cached data
- Insufficient data: Show what's available
- Chart rendering errors: Fallback to text display
- Network issues: Graceful degradation

## Risks & Mitigations

- **Risk**: Complex queries might be slow
  - **Mitigation**: Add database indexes, implement caching
  
- **Risk**: Charts might impact performance
  - **Mitigation**: Use react-native-svg, memoize components
  
- **Risk**: Too much data might overwhelm users
  - **Mitigation**: Progressive disclosure, focus on key insights

## Future Enhancements

- Export performance data
- Compare with other users
- Predictive analytics
- Betting habit insights
- Custom date ranges

## Dependencies

- Mock bet data from Epic 1
- User profiles from Epic 2
- Betting system from Epic 5 (for real data)

## Review Notes

**To be completed by reviewer:**

### Review Checklist
- [ ] Performance queries optimized
- [ ] Charts render smoothly
- [ ] Calculations accurate
- [ ] UI matches design system
- [ ] Responsive on all screens

### Performance Metrics
- Query execution time: < 200ms
- Chart render time: < 100ms
- Memory usage: < 50MB increase

---

**Sprint Started**: [Date]  
**Sprint Completed**: [Date]  
**Actual Duration**: [Time] 