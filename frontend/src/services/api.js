const BASE = import.meta.env.VITE_API_BASE

function getToken() {
  return localStorage.getItem('wp_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data })
  return data
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),

  // Auth
  login:  (email, password)  => request('POST', '/api/auth/login', { email, password }),
  me:     ()                 => request('GET',  '/api/auth/me'),

  // Users
  getUsers:     ()     => request('GET',    '/api/users'),
  createUser:   (body) => request('POST',   '/api/users', body),
  updateUser:   (id, body) => request('PUT', `/api/users/${id}`, body),
  deactivateUser: (id) => request('PATCH',  `/api/users/${id}/deactivate`),

  // Features
  getFeatures:    ()          => request('GET',    '/api/features'),
  createFeature:  (body)      => request('POST',   '/api/features', body),
  updateFeature:  (id, body)  => request('PUT',    `/api/features/${id}`, body),
  deleteFeature:  (id)        => request('DELETE', `/api/features/${id}`),

  // Logs
  getLogs:   (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request('GET', `/api/logs${qs ? '?' + qs : ''}`)
  },
  upsertLog: (body) => request('POST', '/api/logs', body),

  // Blockers
  getBlockers:    (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request('GET', `/api/blockers${qs ? '?' + qs : ''}`)
  },
  createBlocker:  (body) => request('POST',  '/api/blockers', body),
  resolveBlocker: (id)   => request('PATCH', `/api/blockers/${id}/resolve`),

  // Escalations
  getEscalations:    (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request('GET', `/api/escalations${qs ? '?' + qs : ''}`)
  },
  createEscalation:  (body) => request('POST',  '/api/escalations', body),
  resolveEscalation: (id)   => request('PATCH', `/api/escalations/${id}/resolve`),

  // Comments
  getComments:  (logId)  => request('GET',  `/api/comments?log_id=${logId}`),
  postComment:  (body)   => request('POST', '/api/comments', body),

  // Hierarchy
  getHierarchy: ()     => request('GET', '/api/hierarchy'),
  getMyMentor:  ()     => request('GET', '/api/hierarchy/my-mentor'),
  getMyMentees: ()     => request('GET', '/api/hierarchy/my-mentees'),
  setHierarchy: (body) => request('POST', '/api/hierarchy', body),
}
