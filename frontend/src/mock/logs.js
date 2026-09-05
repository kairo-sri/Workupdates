// weeks: last working day (Friday) of each week
export const WEEKS = [
  '2026-08-14',
  '2026-08-21',
  '2026-08-28',
  '2026-09-04',
]

export const MOCK_LOGS = [
  // Sridhar (u1) logs
  {
    id: 'l1', featureId: 'f1', menteeId: 'u1', weekDate: '2026-09-04',
    update: 'Discussed multi-stage sandbox architecture with backend team. Alignment reached.',
    next: 'Start implementation of stage-1 pipeline.',
    blockers: '',
    submittedVia: 'web_app'
  },
  {
    id: 'l2', featureId: 'f2', menteeId: 'u1', weekDate: '2026-09-04',
    update: 'Requirement review with PM for Sandbox Mail Merge. Edge cases documented.',
    next: 'Begin UI wireframes.',
    blockers: '',
    submittedVia: 'cliq_bot'
  },
  {
    id: 'l3', featureId: 'f3', menteeId: 'u1', weekDate: '2026-09-04',
    update: 'Completed PM analysis for Field History Tracking. Reviewed existing audit implementations. Reviewed wireframes with design team. Two iterations. Need to confirm data model. Waiting for Arjun\'s backend schema migration. Raised dependency in Jira.',
    next: 'Follow up on schema migration status.',
    blockers: 'Waiting for Arjun\'s backend schema migration.',
    submittedVia: 'web_app'
  },
  {
    id: 'l4', featureId: 'f4', menteeId: 'u1', weekDate: '2026-08-28',
    update: 'Custom Modules API v2 — pagination logic complete.',
    next: 'Add filtering support.',
    blockers: '',
    submittedVia: 'web_app'
  },
  {
    id: 'l5', featureId: 'f6', menteeId: 'u1', weekDate: '2026-09-04',
    update: 'Sprint planning — Q3 roadmap finalised. Resolved support ticket #2345 — CSV export not working. Researched PostgreSQL audit log patterns for FHT. Evaluated 3 approaches.',
    next: 'Dark mode token implementation.',
    blockers: '',
    submittedVia: 'web_app'
  },
  {
    id: 'l6', featureId: 'f4', menteeId: 'u1', weekDate: '2026-09-04',
    update: 'Sprint planning — Q3 roadmap finalised.',
    next: 'Write API docs.',
    blockers: '',
    submittedVia: 'web_app'
  },
]
