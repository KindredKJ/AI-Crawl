import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
});

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

const PRODUCTS: Record<string, { name: string; description: string; amount: number }> = {
  boost_credits_sm:      { name: 'Data Chip',          description: '+1,000 in-game Credits',             amount: 99  },
  boost_capture:         { name: 'Capture Booster',     description: '+50% capture rate for 10 battles',   amount: 99  },
  boost_xp:              { name: 'XP Surge',            description: '2x XP for 5 battles',                amount: 99  },
  boost_hp:              { name: 'Emergency Repair',    description: 'Full HP restore',                    amount: 99  },
  boost_credits_md:      { name: 'Neural Cache',        description: '+2,500 in-game Credits',             amount: 199 },
  boost_aura:            { name: 'Aura Charge',         description: '3 instant Aura activations',         amount: 199 },
  boost_mats:            { name: 'Scrap Haul',          description: '20 random Crafting Materials',       amount: 199 },
  boost_premium_capture: { name: 'Prime Capture Node',  description: 'Guaranteed capture any rarity',      amount: 299 },
  bundle_starter:        { name: 'Starter Kit',         description: 'Credits + captures + XP boost',      amount: 499 },
  bundle_hunter:         { name: 'Entity Hunter Pack',  description: '3 guaranteed captures + crates',     amount: 799 },
  bundle_crafter:        { name: 'Forge Master Bundle', description: '60 mats + weapon crate',             amount: 799 },
  bundle_power:          { name: 'Power Surge Pack',    description: '20 battles 2x XP + 5 aura charges', amount: 999 },
  bundle_mega:           { name: 'Nexus Arsenal',       description: '15k credits + 5 captures + crates',  amount: 1499},
  bundle_founder:        { name: 'Founders Vault',      description: '30k credits + 10 captures + crates', amount: 1999},
};

async function getOrCreatePrice(productId: string): Promise<string> {
  const meta = PRODUCTS[productId];
  if (!meta) throw new Error('Unknown product: ' + productId);

  const prices = await stripe.prices.list({ active: true, limit: 100 });
  const existing = prices.data.find(p => p.metadata?.ai_crawl_product_id === productId);
  if (existing) return existing.id;

  const stripeProduct = await stripe.products.create({
    name: 'AI Crawl - ' + meta.name,
    description: meta.description,
    metadata: { ai_crawl_product_id: productId },
  });

  const price = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: meta.amount,
    currency: 'usd',
    metadata: { ai_crawl_product_id: productId },
  });

  return price.id;
}

Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
  }

  try {
    const { productId, successUrl, cancelUrl, userId } = await req.json();

    if (!productId || !successUrl || !cancelUrl) {
      return Response.json({ error: 'Missing productId, successUrl, or cancelUrl' }, { status: 400, headers });
    }

    if (!PRODUCTS[productId]) {
      return Response.json({ error: 'Unknown product' }, { status: 400, headers });
    }

    const priceId = await getOrCreatePrice(productId);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}&product_id=' + productId,
      cancel_url: cancelUrl,
      metadata: { ai_crawl_product_id: productId, user_id: userId ?? 'anonymous' },
      billing_address_collection: 'auto',
    });

    return Response.json({ url: session.url, sessionId: session.id }, { headers });
  } catch (err: any) {
    console.error('createCheckout error:', err.message);
    return Response.json({ error: err.message }, { status: 500, headers });
  }
});
