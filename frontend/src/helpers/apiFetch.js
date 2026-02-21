import { url } from './url';

let refreshPromise = null;

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const res = await fetch(`${url}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiFetch(input, init = {}, allowRetry = true) {
  const first = await fetch(input, {
    ...init,
    credentials: 'include',
  });

  if (first.status !== 401 || !allowRetry) {
    return first;
  }

  const rawUrl = typeof input === 'string' ? input : String(input?.url || '');
  if (rawUrl.includes('/auth/refresh')) {
    return first;
  }

  let refreshed = false;
  try {
    refreshed = await refreshAccessToken();
  } catch (_) {
    refreshed = false;
  }

  if (!refreshed) {
    return first;
  }

  return fetch(input, {
    ...init,
    credentials: 'include',
  });
}
