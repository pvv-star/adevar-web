/**
 * Stripe client and helpers for subscription billing.
 * 50 lei/month (~$2.75) premium plan.
 */

import Stripe from 'stripe';

let stripeClient = null;

export function getStripe() {
  if (stripeClient) return stripeClient;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');

  stripeClient = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
  return stripeClient;
}

/**
 * Create a Stripe Checkout session for a new subscription.
 *
 * @param {{ userId: string, email: string, customerId?: string }} opts
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export async function createCheckoutSession({ userId, email, customerId }) {
  const stripe = getStripe();
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (!priceId) throw new Error('NEXT_PUBLIC_STRIPE_PRICE_ID not set');

  const params = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adevar.ai'}/profil?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adevar.ai'}/profil`,
    client_reference_id: userId,
    metadata: { userId },
  };

  if (customerId) {
    params.customer = customerId;
  } else {
    params.customer_email = email;
  }

  return stripe.checkout.sessions.create(params);
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 *
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Stripe.BillingPortal.Session>}
 */
export async function createPortalSession(customerId) {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adevar.ai'}/profil`,
  });
}
