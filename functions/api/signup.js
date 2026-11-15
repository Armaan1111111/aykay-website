
export async function onRequestPost({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (!env.DB) {
    return new Response(JSON.stringify({
      error: 'Email sign-ups are not connected yet.'
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

  if (body.website) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers
    });
  }

  const email = typeof body.email === 'string'
    ? body.email.trim().toLowerCase()
    : '';

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    body.consent !== true
  ) {
    return new Response(JSON.stringify({
      error: 'Enter a valid email and agree to receive launch updates.'
    }), { status: 400, headers });
  }

  try {
    await env.DB.prepare(
      'INSERT INTO signups (email, consent, created_at) VALUES (?, 1, datetime("now")) ON CONFLICT(email) DO NOTHING'
    ).bind(email).run();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers
    });
  } catch {
    return new Response(JSON.stringify({
      error: 'We could not save your email just now. Please try again.'
    }), { status: 500, headers });
  }
}
