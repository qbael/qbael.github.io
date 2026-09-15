export const VIEW_COOKIE = 'portfolio_view_counted';
export const READ_VIEW_COUNT_SQL =
  'SELECT total FROM page_view_counter WHERE id = ?';
export const INCREMENT_VIEW_COUNT_SQL = `INSERT INTO page_view_counter (id, total)
VALUES (1, 1)
ON CONFLICT(id) DO UPDATE SET total = page_view_counter.total + 1
RETURNING total`;

export type ViewCountStore = {
  read: () => Promise<unknown>;
  increment: () => Promise<unknown>;
};

export function hasCountedView(cookieHeader: string | null) {
  return Boolean(
    cookieHeader
      ?.split(';')
      .map((cookie) => cookie.trim())
      .includes(`${VIEW_COOKIE}=1`),
  );
}

function json(body: object, status = 200, headers: HeadersInit = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Cache-Control', 'no-store');
  return Response.json(body, { status, headers: responseHeaders });
}

export async function handleVisitRequest(
  request: Request,
  createStore: () => ViewCountStore,
) {
  if (
    request.headers.get('origin') !== null &&
    request.headers.get('origin') !== new URL(request.url).origin
  ) {
    return json({ error: 'forbidden' }, 403);
  }

  try {
    const counted = hasCountedView(request.headers.get('cookie'));
    const row = await (counted
      ? createStore().read()
      : createStore().increment());
    const total = (row as { total?: unknown } | null)?.total;
    if (
      typeof total !== 'number' ||
      !Number.isSafeInteger(total) ||
      total < 0
    ) {
      throw new Error('Invalid page-view row');
    }

    const cookie = [
      `${VIEW_COOKIE}=1`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      new URL(request.url).protocol === 'https:' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');

    return json({ total }, 200, counted ? {} : { 'Set-Cookie': cookie });
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}
