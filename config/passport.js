const LocalStrategy = require('passport-local').Strategy;
const request = require('request');
const randomize = require('randomatic');

// const crypto = require("crypto");
// const id = crypto.randomBytes(16).toString("hex");

//------------ API Configuration ------------//
const baseUrl = require('../config/key').baseUrl;

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //------------ User Matching ------------//
            console.log('in passport'); 

            // generate random keys 
            var grk = randomize('0', 9)+ "-"+randomize('0a', 5);
            const device_id = grk+"~WEB~"+Date.now();
            // console.log(device_id);

            request({
                headers: {
                  'Content-Type': 'application/json'
                },
                url: baseUrl+'/user/Login',
                method: 'POST',
                body:{
                    "email": email,
                    "password": password,
                    "os": "WEB",
                    "device_id": device_id,
                    "platform": "WEB",
                    "mc_version": "3.0",
                    "firebase_token": ""
                    },
                json: true
              }, function (err, res, body) {

                // console.log(device_id);

                if (err) { 
                    return done(null, false, { message: 'Login Error!' });  
                 }
                //  console.log(body);
                if (body.Status == 'Success') {
                    grk = 0;
                    return done(null, body.user);

                }else if(body.Status == 'Fail'){
                    return done(null, false, { message: `Invalid Login! ${body.Details}` });  
                }else{
                    return done(null, false, { message: 'Invalid Login! ${body.Details}' });  
                }
            });

        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
        // console.log('deserialize: ');
        // console.log(user);   
    });
};