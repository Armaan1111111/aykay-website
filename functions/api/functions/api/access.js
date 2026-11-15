export async function onRequestPost({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (!env.ACCESS_PASSWORD) {
    return new Response(JSON.stringify({
      error: 'Early access is not configured yet.'
    }), { status: 503, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({
      error: 'Invalid request.'
    }), { status: 400, headers });
  }

  const supplied = typeof body.password === 'string'
    ? body.password
    : '';

  const encoder = new TextEncoder();
  const a = await crypto.subtle.digest(
    'SHA-256', encoder.encode(supplied)
  );
  const b = await crypto.subtle.digest(
    'SHA-256', encoder.encode(env.ACCESS_PASSWORD)
  );

  const aa = new Uint8Array(a);
  const bb = new Uint8Array(b);
  let diff = 0;

  for (let i = 0; i < aa.length; i++) {
    diff |= aa[i] ^ bb[i];
  }

  if (diff !== 0) {
    return new Response(JSON.stringify({
      error: 'That password is not correct.'
    }), { status: 401, headers });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers
  });
}
