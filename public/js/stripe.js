/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NrZRJSGFt5dwNuBMwC9KSVAbzSFq0msYLqXcJg5rL3l6u56Z3Je5pDNq5eo3Qs6J4OdV0ioDvPIIF7YDNvrRR8N002UZ1jNZE',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkput session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
