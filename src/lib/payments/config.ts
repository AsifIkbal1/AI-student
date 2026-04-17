import { loadStripe } from '@stripe/stripe-js';

// Plan Prices (in USD for Stripe, will convert to BDT for SSLCommerz)
export const PLANS = {
  pro: {
    monthly_usd: 9.99,
    yearly_usd: 99.99,
    monthly_bdt: 1200,
    yearly_bdt: 11500,
    credits: 5000,
  },
  premium: {
    monthly_usd: 19.99,
    yearly_usd: 199.99,
    monthly_bdt: 2400,
    yearly_bdt: 23000,
    credits: 15000,
  }
};

export const getStripe = () => {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!publicKey) return null;
  return loadStripe(publicKey);
};
