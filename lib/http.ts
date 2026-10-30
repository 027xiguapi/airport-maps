/**
 * Shared request helpers used by the API routes (and only there).
 *
 * Both the comment and the deal endpoints need the caller's address for
 * rate-limiting, and the OAuth routes need the public origin to build a
 * redirect URI behind the reverse proxy. Keeping the parsing in one place
 * means the two features agree on which hop of `X-Forwarded-For` counts.
 */

/** First hop of X-Forwarded-For, with the usual proxy fallbacks. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || '0.0.0.0';
}

/** True when the browser reached us over HTTPS (directly or via a proxy). */
export function isSecureRequest(request: Request): boolean {
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (proto) return proto === 'https';
  return new URL(request.url).protocol === 'https:';
}

/**
 * The origin the visitor actually used: the forwarded host/protocol when a
 * reverse proxy terminates TLS, otherwise the request's own origin. OAuth
 * redirect URIs must match the address registered in the Google console, so
 * this has to be the public origin and not the container's internal one.
 */
export function requestOrigin(request: Request): string {
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.trim();
  if (!host) return new URL(request.url).origin;
  const proto = isSecureRequest(request) ? 'https' : 'http';
  return `${proto}://${host}`;
}

/** Same-origin check for state-changing requests (logout, submissions). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  // No Origin header: a non-browser client (curl) or a same-origin form post.
  // The session cookie is SameSite=Lax, so this is already not cross-site.
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(requestOrigin(request)).host;
  } catch {
    return false;
  }
}
