import { getStripe } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[api] billing/webhook: STRIPE_WEBHOOK_SECRET not set');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[api] billing/webhook: signature verification failed:', err?.message);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        if (!userId) break;

        await supabase
          .from('profiles')
          .update({
            tier: 'premium',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq('id', userId);

        console.log(`[api] billing/webhook: user ${userId} upgraded to premium`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await supabase
          .from('profiles')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId);

        console.log(`[api] billing/webhook: customer ${customerId} subscription cancelled`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        console.warn(`[api] billing/webhook: payment failed for customer ${customerId}`);
        // Optionally downgrade after X failed attempts
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error(`[api] billing/webhook: error handling ${event.type}:`, err?.message || err);
    return new Response('Webhook handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
