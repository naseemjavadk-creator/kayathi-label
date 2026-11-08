import { NextResponse } from 'next/server';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const attemptsByIp = new Map();

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function prune(now) {
  for (const [ip, entry] of attemptsByIp.entries()) {
    if (now > entry.resetAt) attemptsByIp.delete(ip);
  }
}

export async function POST(request) {
  const now = Date.now();
  prune(now);
  const ip = getClientIp(request);
  let body = {};
  try {
    body = await request.json();
  } catch {}

  if (body?.action === 'reset') {
    attemptsByIp.delete(ip);
    return NextResponse.json({ allowed: true, remaining: MAX_ATTEMPTS });
  }

  const current = attemptsByIp.get(ip);
  if (current && current.count >= MAX_ATTEMPTS && now < current.resetAt) {
    const retryAfterSec = Math.ceil((current.resetAt - now) / 1000);
    return NextResponse.json(
      {
        allowed: false,
        retryAfterSec,
        message: `Too many login attempts. Please wait ${Math.ceil(retryAfterSec / 60)} minute(s) before trying again.`,
      },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    );
  }

  const nextCount = current && now < current.resetAt ? current.count + 1 : 1;
  const resetAt = current && now < current.resetAt ? current.resetAt : now + WINDOW_MS;
  attemptsByIp.set(ip, { count: nextCount, resetAt });

  return NextResponse.json({
    allowed: true,
    remaining: Math.max(0, MAX_ATTEMPTS - nextCount),
  });
}
