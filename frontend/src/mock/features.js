export const MOCK_FEATURES = [
  { id: 'f1', name: 'Multi-stage Sandbox', description: 'Sandbox environment with multi-stage support', category: 'Infrastructure', status: 'blocked', progress: 65, menteeId: 'u1', createdBy: 'u1' },
  { id: 'f2', name: 'Sandbox Mail Merge', description: 'Mail merge within sandbox environment', category: 'Feature', status: 'blocked', progress: 40, menteeId: 'u1', createdBy: 'u3' },
  { id: 'f3', name: 'Field History Tracking', description: 'Track field-level changes with audit log', category: 'Feature', status: 'blocked', progress: 30, menteeId: 'u1', createdBy: 'u1', blockerReason: 'Waiting for backend schema migration' },
  { id: 'f4', name: 'Custom Modules API', description: 'API endpoints for custom module management', category: 'API', status: 'active', progress: 80, menteeId: 'u1', createdBy: 'u4' },
  { id: 'f5', name: 'API Rate Limiting', description: 'Per-user API rate limiting', category: 'API', status: 'completed', progress: 100, menteeId: 'u1', createdBy: 'u1' },
  { id: 'f6', name: 'Dark Mode', description: 'System-wide dark mode support', category: 'UI', status: 'active', progress: 55, menteeId: 'u1', createdBy: 'u3' },
  { id: 'f7', name: 'Bulk Import', description: 'CSV bulk import for records', category: 'Feature', status: 'active', progress: 20, menteeId: 'u2', createdBy: 'u2' },
  { id: 'f8', name: 'Webhook Integration', description: 'Outbound webhook support', category: 'API', status: 'active', progress: 45, menteeId: 'u5', createdBy: 'u3' },
]

export const CATEGORIES = ['All', 'Infrastructure', 'Feature', 'API', 'UI']
