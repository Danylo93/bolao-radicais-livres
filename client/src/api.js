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
  user: (id) => req(`/users/${id}`),
  saveBets: (id, bets) =>
    req(`/users/${id}/bets`, { method: 'POST', body: JSON.stringify({ bets }) }),
  ranking: () => req('/ranking'),

  adminLogin: (key) => req('/admin/login', { method: 'POST', body: JSON.stringify({ key }) }),
  adminUsers: (key) => req('/admin/users', { headers: { 'x-admin-key': key } }),
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
