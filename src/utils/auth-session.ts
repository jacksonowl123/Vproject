export const AUTH_SESSION_EXPIRED_EVENT = 'auth-session-expired';

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return null;

    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + (4 - normalizedPayload.length % 4) % 4,
      '='
    );

    return JSON.parse(atob(paddedPayload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  const expiresAt = typeof payload?.exp === 'number' ? payload.exp * 1000 : null;

  return expiresAt !== null && expiresAt <= Date.now();
}

export function expireSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('username');

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

export function isAuthenticationError(error: any): boolean {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || error?.message || '').toLowerCase();

  return status === 401
    || status === 419
    || message.includes('token expired')
    || message.includes('token has expired')
    || message.includes('jwt expired')
    || message.includes('unauthenticated');
}
