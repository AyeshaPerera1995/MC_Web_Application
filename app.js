const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const passport = require('passport');
const nodemailer = require('nodemailer');
var path = require('path');
const fs =   require('fs');
const https = require('https');





//const stripe = require('stripe')('sk_test_51IhR7KJLAaODEjT2zBjLB3pW2WMGR5iFXTDRA6OkW5D1qA1w6xZWurSMExGdYxms97yRChJpdzsem9YdcySiLs0s00mJytPMNX');
// const priceId = '{{PRICE_ID}}';

// const STRIPE_API = require('./api/stripe-functions.js');


// const envFilePath = path.resolve(__dirname, './.env');
// const env = require("dotenv").config({ path: envFilePath });
// if (env.error) {
//   throw new Error(`Unable to load the .env file from ${envFilePath}. Please copy .env.example to ${envFilePath}`);
// }

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2020-08-27',
//   appInfo: { // For sample support and debugging, not required for production:
//     name: "stripe-samples/checkout-single-subscription",
//     version: "0.0.1",
//     url: "https://github.com/stripe-samples/checkout-single-subscription"
//   }
// });


const app = express();


//------------ Passport Configuration ------------//
require('./config/passport')(passport);

//------------ Express session Configuration ------------//

const time = 1000 * 60 * 60 * 12; //12 hours
app.use(
  session({
      secret: 'secretkeyboarddogfhrgfgrfrty84fwir7679',
      resave: false,
      cookie: { maxAge: time },
      saveUninitialized: true
  })
);

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static((__dirname + '/public')));

// cookie parser middleware
app.use(cookieParser());

//------------ Passport Middlewares ------------//
app.use(passport.initialize());
app.use(passport.session());

const httpOptions = {
  cert: fs.readFileSync(path.join(__dirname,'ssl','mcapp.crt')),
  key: fs.readFileSync(path.join(__dirname,'ssl','mcapp.key'))
} 



//------------ Connecting flash ------------//
app.use(flash());

//------------ Global variables ------------//
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.current_user = req.user;
  next();
});





var transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Office 365 server
    port: 587,     // secure SMTP
    secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
    auth: {
        user: 'no-reply@platnedsyngco.com',
        pass: 'Pub46391'

    },
    tls: {
        ciphers: 'SSLv3'
    }
  });

app.set('mailtrans',transporter);






//------------ Routes ------------//
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/clips', require('./routes/clips'));
app.use('/devices', require('./routes/devices'));
app.use('/subscribe', require('./routes/subscribe'))

// 404 Error Page handling 
app.get('*', (req, res) =>{
  // res.status(404).send('404 Page');
  // console.log(__dirname);
  res.sendFile(__dirname+'/views/404.html');
});




// app.get("/checkout-session", async (req, res) => {
//   const { sessionId } = req.query;
//   const session = await stripe.checkout.sessions.retrieve(sessionId);
//   res.send(session);
// });

// app.post("/create-checkout-session", async (req, res) => {
//   const domainURL = process.env.DOMAIN;
//   const { priceId,customeremail,customerId } = req.body;

//   // Create new Checkout Session for the order
//   // Other optional params include:
//   // [billing_address_collection] - to display billing address details on the page
//   // [customer] - if you have an existing Stripe Customer ID
//   // [customer_email] - lets you prefill the email input in the form
//   // For full details see https://stripe.com/docs/api/checkout/sessions/create
//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       payment_method_types: ["card"],
//       customer:customerId,
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
//       mode: 'subscription',
//       allow_promotion_codes: true,
//       success_url: `${domainURL}/?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${domainURL}`,
//     });
//     console.log(session);

//     return res.redirect(303, session.url);
//   } catch (e) {
//     res.status(400);
//     return res.send({
//       error: {
//         message: e.message,
//       }
//     });
//   }
// });

// app.get("/config", (req, res) => {
//   res.send({
//     publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//     basicPrice: process.env.BASIC_PRICE_ID,
//     proPrice: process.env.PRO_PRICE_ID,
//   });
// });

// app.post('/customer-portal', async (req, res) => {
//   // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
//   // Typically this is stored alongside the authenticated user in your database.
//   const { sessionId } = req.body;
//   const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

//   // This is the url to which the customer will be redirected when they are done
//   // managing their billing with the portal.
//   const returnUrl = process.env.DOMAIN;

//   const portalSession = await stripe.billingPortal.sessions.create({
//     customer: checkoutSession.customer,
//     return_url: returnUrl,
//   });

//   res.redirect(303, portalSession.url);
// });

// Webhook handler for asynchronous events.
// app.post("/webhook", async (req, res) => {
//   let data;
//   let eventType;
//   // Check if webhook signing is configured.
//   if (process.env.STRIPE_WEBHOOK_SECRET) {
//     // Retrieve the event by verifying the signature using the raw body and secret.
//     let event;
//     let signature = req.headers["stripe-signature"];

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.rawBody,
//         signature,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.log(`⚠️  Webhook signature verification failed.`);
//       return res.sendStatus(400);
//     }
//     // Extract the object from the event.
//     data = event.data;
//     eventType = event.type;
//   } else {
//     // Webhook signing is recommended, but if the secret is not configured in `config.js`,
//     // retrieve the event data directly from the request body.
//     data = req.body.data;
//     eventType = req.body.type;
//   }

//   if (eventType === "checkout.session.completed") {
//     console.log(`🔔  Payment received!`);
//   }

//   res.sendStatus(200);
// });



// const PORT = process.env.PORT || 443;
// https.createServer(httpOptions,app).listen(PORT, console.log(`Server Started on port ${PORT}`));

const PORT = process.env.PORT || 3500;
app.listen(PORT, console.log(`Server running on PORT ${PORT}`));