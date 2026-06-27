const BASE = '/api';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo deu errado. Tente de novo.');
  return data;
}

export const api = {
  state: () => req('/state'),
  register: (body) => req('/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (telefone) => req('/login', { method: 'POST', body: JSON.stringify({ telefone }) }),
  updateProfile: (id, body) => req(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  user: (id) => req(`/users/${id}`),
  saveBets: (id, bets) =>
    req(`/users/${id}/bets`, { method: 'POST', body: JSON.stringify({ bets }) }),
  ranking: () => req('/ranking'),

  adminLogin: (key) => req('/admin/login', { method: 'POST', body: JSON.stringify({ key }) }),
  adminUsers: (key) => req('/admin/users', { headers: { 'x-admin-key': key } }),
  adminUpdateUser: (key, id, patch) =>
    req(`/admin/users/${id}`, {
      method: 'POST',
      headers: { 'x-admin-key': key },
      body: JSON.stringify(patch),
    }),
  adminDeleteUser: (key, id) =>
    req(`/admin/users/${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } }),
  adminAddActivity: (key, userId, kind) =>
    req(`/admin/users/${userId}/activity`, {
      method: 'POST',
      headers: { 'x-admin-key': key },
      body: JSON.stringify({ kind }),
    }),
  adminDeleteActivity: (key, activityId) =>
    req(`/admin/activities/${activityId}`, { method: 'DELETE', headers: { 'x-admin-key': key } }),
  adminMatch: (key, id, patch) =>
    req(`/admin/match/${id}`, {
      method: 'POST',
      headers: { 'x-admin-key': key },
      body: JSON.stringify(patch),
    }),
  adminReset: (key, what) =>
    req('/admin/reset', {
      method: 'POST',
      headers: { 'x-admin-key': key },
      body: JSON.stringify({ what }),
    }),
  adminSync: (key) =>
    req('/admin/sync', { method: 'POST', headers: { 'x-admin-key': key } }),
};
