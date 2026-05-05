import { loadStripe } from '@stripe/stripe-js';

// Plan Prices (Psychological pricing: 499 BDT / 999 BDT)
export const PLANS = {
  pro: {
    monthly_usd: 4.99,
    yearly_usd: 49.99,
    monthly_bdt: 499,
    yearly_bdt: 4999,
    credits: 5000,
  },
  premium: {
    monthly_usd: 9.99,
    yearly_usd: 99.99,
    monthly_bdt: 999,
    yearly_bdt: 9999,
    credits: 15000,
  }
};

export const getStripe = () => {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!publicKey) return null;
  return loadStripe(publicKey);
};
