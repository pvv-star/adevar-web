import { getUser } from '@/lib/auth-helpers';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request) {
  try {
    const auth = await getUser(request);
    if (!auth) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (auth.profile?.tier === 'premium') {
      return new Response(JSON.stringify({ ok: false, error: 'already_premium' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await createCheckoutSession({
      userId: auth.user.id,
      email: auth.user.email,
      customerId: auth.profile?.stripe_customer_id || undefined,
    });

    return new Response(JSON.stringify({ ok: true, url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api] billing/checkout failed:', err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: 'checkout_failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
