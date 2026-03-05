import { getUser } from '@/lib/auth-helpers';
import { createPortalSession } from '@/lib/stripe';

export async function POST(request) {
  try {
    const auth = await getUser(request);
    if (!auth) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const customerId = auth.profile?.stripe_customer_id;
    if (!customerId) {
      return new Response(JSON.stringify({ ok: false, error: 'no_subscription' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await createPortalSession(customerId);

    return new Response(JSON.stringify({ ok: true, url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api] billing/portal failed:', err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: 'portal_failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
