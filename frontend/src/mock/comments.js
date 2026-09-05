export const MOCK_COMMENTS = [
  {
    id: 'c1', logId: 'l3', commentedBy: 'u4', commenterName: 'Deepa Nair', commenterRole: 'manager', commenterAvatar: 'DN',
    text: 'Good progress on the analysis. Please follow up with Arjun today on the schema migration blocker.',
    createdAt: '2026-09-04T10:30:00',
    parentId: null,
  },
  {
    id: 'c2', logId: 'l3', commentedBy: 'u1', commenterName: 'Sridhar R.', commenterRole: 'mentee', commenterAvatar: 'SR',
    text: 'Will do! Already sent him a message on Cliq.',
    createdAt: '2026-09-04T11:00:00',
    parentId: 'c1',
  },
  {
    id: 'c3', logId: 'l1', commentedBy: 'u3', commenterName: 'Arjun Kumar', commenterRole: 'mentor', commenterAvatar: 'AK',
    text: 'Nice work on getting the alignment. Make sure to document the decisions made.',
    createdAt: '2026-09-04T09:00:00',
    parentId: null,
  },
]
