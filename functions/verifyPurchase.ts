import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
});

// Server-authoritative verification. The client must NOT grant rewards from a
// URL param alone — it must call this endpoint with the Stripe session_id and
// only fulfill when Stripe confirms payment_status === 'paid'.
//
// To prevent replay (one paid session granting rewards repeatedly), each
// verified session_id is recorded in Deno KV and refused on subsequent calls.

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    ALLOWED_ORIGINS.length === 0
      ? '*'
      : origin && ALLOWED_ORIGINS.includes(origin)
        ? origin
        : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

let kvPromise: Promise<Deno.Kv> | null = null;
function getKv(): Promise<Deno.Kv> {
  if (!kvPromise) kvPromise = Deno.openKv();
  return kvPromise;
}

Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return Response.json({ error: 'Missing sessionId' }, { status: 400, headers });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json(
        { verified: false, reason: 'not_paid', paymentStatus: session.payment_status },
        { status: 200, headers },
      );
    }

    const productId = session.metadata?.ai_crawl_product_id ?? null;
    if (!productId) {
      return Response.json(
        { verified: false, reason: 'missing_product_metadata' },
        { status: 200, headers },
      );
    }

    // Replay protection: a paid session can only be fulfilled once.
    const kv = await getKv();
    const key = ['ai_crawl_fulfilled', sessionId];
    const existing = await kv.get(key);
    if (existing.value) {
      return Response.json(
        { verified: false, reason: 'already_fulfilled', productId },
        { status: 200, headers },
      );
    }
    await kv.set(key, { fulfilledAt: new Date().toISOString(), productId }, {
      // expire records after 90 days; Stripe sessions are long-expired by then
      expireIn: 90 * 24 * 60 * 60 * 1000,
    });

    return Response.json(
      {
        verified: true,
        productId,
        userId: session.metadata?.user_id ?? 'anonymous',
        amountTotal: session.amount_total,
        currency: session.currency,
      },
      { status: 200, headers },
    );
  } catch (err: any) {
    console.error('verifyPurchase error:', err?.message ?? err);
    return Response.json({ error: 'verification_failed' }, { status: 500, headers });
  }
});
