const express = require('express');
const router = express.Router();

require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const YOUR_DOMAIN = 'http://localhost:3500';
// const YOUR_DOMAIN = 'https://magiccopy.app';
const { ensureAuthenticated } = require('../config/checkAuth')

const request = require('request');
const baseUrl = require('../config/key').baseUrl;

router.post('/packages', ensureAuthenticated, (req,resp) =>{
    const accToken = req.body.access_token;

    // Get all account details
    request({
        headers: {
            'AccessToken': accToken
        },
        url: baseUrl+'/User/checkAccountDetails',
        method: 'GET',
        json: true
    }, function (err, res, body) {
        if (err) { 
            req.flash('error_msg', 'Error!');
            resp.redirect('login'); 
         }
            resp.render('packages', {accToken:accToken ,details:body});
        
    });
       
});

router.post('/create-checkout-session', ensureAuthenticated, async (req, res) => {

  const customer_id = req.body.customer_id;
  const plan_id = req.body.plan_id;

if(plan_id ==1){
  console.log("free plan to paid plan");
  const prices = await stripe.prices.list({
    product: req.body.product_id,
    expand: ['data.product'],
    // lookup_keys: [req.body.lookup_key],
  });

  const session = await stripe.checkout.sessions.create({
    customer: customer_id,
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data[0].id,
        quantity: 1,

      },
    ],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/dashboard`,
    
  });

 //  console.log(session.url);   
  res.redirect(303, session.url);

}else{

  console.log("already have a paid plan");
const returnUrl = `${YOUR_DOMAIN}/dashboard`;
  
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customer_id,
  return_url: returnUrl,
});
res.redirect(303, portalSession.url);

console.log("Portal Session: "+portalSession.url);

}
  
 
});



router.get('/success', (req, res) => res.render('success'));



router.post('/create-portal-session', ensureAuthenticated, async (req, res) => {

  const { session_id } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
  console.log("cus id: "+checkoutSession.customer);

  const returnUrl = `${YOUR_DOMAIN}/dashboard`;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });
  res.redirect(303, portalSession.url);
  
});

router.post('/customer-portal', ensureAuthenticated, async (req, res) => {
  const customer_id = req.body.customer_id;

    // get the cus id using customer email, from DB 
    // const customer = await stripe.customers.retrieve('cus_Lk8gTh9rjgk0SH');
  
    const returnUrl = `${YOUR_DOMAIN}/dashboard`;
  
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: returnUrl,
    });
    res.redirect(303, portalSession.url);
  
    console.log("Portal Session: "+portalSession.url);
  
  
    
  });


















router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (request, response) => {
    let event = request.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = 'whsec_12345';
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }
    let subscription;
    let status;
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case 'customer.subscription.created':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription created.
        // handleSubscriptionCreated(subscription);
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription update.
        // handleSubscriptionUpdated(subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

module.exports = router;