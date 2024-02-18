const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const passport = require('passport');
const nodemailer = require('nodemailer');
var path = require('path');
const fs =   require('fs');
const https = require('https');
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
    host: '', // Office 365 server
    port: 587,     // secure SMTP
    secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
    auth: {
        user: '',
        pass: ''

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

const PORT = process.env.PORT || 3500;
app.listen(PORT, console.log(`Server running on PORT ${PORT}`));
