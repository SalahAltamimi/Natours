import axios from 'axios';
import { showmsg } from './alerts';
import { loadStripe } from '@stripe/stripe-js';

export const CheckOuts = async (tourId) => {
  try {
    const stripe = await loadStripe(
      'pk_test_51PNdhAKdu5i7flk3zTO3PhFFXx4hOy5KspRSSB2YYT7X2llhhSy00PkURRfbmoWeHcRqRORNVzkkdCH6UFdKHcH000dhq0dHmY'
    );
    const session = await axios({
      method: 'GET',
      url: `/api/v1/booking/checkout-session/${tourId}`,
    });
    console.log(session);
    stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showmsg('error', err.response.data.message);
    console.log(err);
  }
};
