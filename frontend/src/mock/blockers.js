export const MOCK_BLOCKERS = [
  {
    id: 'b1', featureId: 'f1', menteeId: 'u1',
    description: 'Need design sign-off on multi-stage progress bar UI — design team has been unresponsive for 2 days.',
    priority: 'medium',
    status: 'active',
    daysBlocked: 2,
    createdAt: '2026-09-02',
  },
  {
    id: 'b2', featureId: 'f3', menteeId: 'u1',
    description: 'Waiting for Arjun\'s backend schema migration. Raised dependency in Jira 4 days ago, no update yet.',
    priority: 'high',
    status: 'resolved',
    daysBlocked: 4,
    createdAt: '2026-08-30',
  },
]
