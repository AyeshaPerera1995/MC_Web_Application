const passport = require('passport');
const request = require('request');
const randomize = require('randomatic');

//------------ API Configuration ------------//
const baseUrl = require('../config/key').baseUrl;
const fireKey = require('../config/key').fireKey;

// a variable to save a session
var session;

//------------ Login Handle ------------//
exports.loginHandle = (req, resp, next) => {
    console.log('in auth controller');

// check whether this user is available in sql database 
const {email,password} = req.body;
resp.cookie('email', email);
// session = req.session;
// session.userid = email;
console.log('req.cookies.email '+req.cookies.email);
// console.log('session.userid:  '+session.userid);


request({
    url: baseUrl+'/user/checkemail?email='+email,
    method: 'GET',
    json: true
  }, function (err, res, body) {
    console.log(body); 
    if (body.hasAccount == false) {
        // check whether this user has an account in firebase db
        request({
            url: "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="+fireKey,
            method: 'POST',
            body:{
                "email": email,
                "password": password,
                "returnSecureToken": "true"
            },
            json: true
          }, function (err, res, body) {
            console.log(body);  
            console.log(email);  
            if (body.email == email) {
                // have firebase account 
                console.log('have firebase acc');

  // generate random keys 
  const grk = randomize('0', 9)+ "-"+randomize('0a', 5);
  const device_id = grk+"~WEB~"+Date.now();

                // call sign up 
                request({
                    headers: {
                        'Content-Type': 'application/json'
                      },
                      url: baseUrl+'/user/userregistration',
                      method: 'POST',
                      body:{
                        "name": "Magic Copy User",
                        "email": body.email,
                        "password": password,
                        "platform": "WEB",
                        "os": "WEB",
                        "device_id": device_id,
                        "firebase_account": 1,
                        "firebase_id":body.localId,
                        "mc_version": "3.0",
                        "firebase_token": body.idToken
                          },
                    json: true
                  }, function (err, res, body) {
                      if (body.Status == 'Success') {
                          //cerate new account in sql
                        console.log(body.Status);    
                        var access_token = body.user.access_token;
                        var email = body.user.email;

                        // get last 20 clips from firebase 
                        request({
                            url: 'https://pasteit-7c964.firebaseio.com/clips/'+body.user.firebase_id+'.json?auth='+body.user.firebase_token+'&limitToLast=20&orderBy="copied_at_timestamp"',
                            method: 'GET',
                            json: true
                          }, function (err, res, body) {
                            // console.log(body); 
                            if(body != null){
                              var obj_count  = Object.keys(body).length;
                              for (let i = 0; i < obj_count; i++) {
                                  var content = Object.values(body)[i].text;
                                  // console.log(content);
                             
                                  // save last 20 clips in sql db 
                                  request({
                                      headers: {
                                          'Content-Type': 'application/json',
                                          'AccessToken': access_token
                                        },
                                      url: baseUrl+'/clip/saveclip',
                                      method: 'POST',
                                      body:{
                                          "contentType": "TEXT",
                                          "content": content,
                                          "userGroup": "NA"
                                      },
                                      json: true
                                      }, function (err, res, body) {
                                          if (err) {
                                              console.log(err);
                                          }
                                          console.log('saved');
                                      });
                                  
                              } //end for loop
  
                            }
                            // send verification email 
                            resp.render('verify',{userdata:email});
                            
                        });

                        
                      }else{
                        console.log("error creating an account");  
                        resp.clearCookie("email");
                        req.flash('error_msg', 'System Error!');
                        resp.redirect('login'); 
                      }
                                       
                });



            }else{
                console.log('Invalid Email or Passsword !');
                resp.clearCookie("email");
                req.flash('error_msg', 'Invalid Login! Wrong Email or Passsword');
                resp.redirect('login');
            }
        });
        
    }else{
        // already have an account in sql
        console.log('have account in sql db');
        
        // check email is verified or not 
        if (body.verified == false) {
            console.log(body.verified);

              // call verify email 
              resp.render('verify',{userdata:email});

            
        }else if(body.verified == true){
            console.log(body.verified);
            
            // login process 
            passport.authenticate('local', {
                successRedirect: '/dashboard/',
                failureRedirect: '/auth/login',
                failureFlash: true
            })(req, resp, next);
        
        }

    }
       
});
 
}

exports.verifyCode = (req, resp, next) => {
    const {email,code} = req.body;
    console.log(code);
    request({
        headers: {
            'Content-Type': 'application/json'
        },
        url: baseUrl+"/user/verifyemail?",
        method: 'POST',
        body:{
            "email": email,
            "code": code
        },
        json: true
      }, function (err, res, body) {
        console.log(body); 
        if (body.Status =='Fail') {
            console.log(body.Details);
            req.flash('error', body.Details);
            resp.render('verify',{userdata:email,error_msg:'Invalid Code! Please try again.'});
        }else{
            req.flash('success_msg', 'Account Activated');
            resp.redirect('login');
        }
      });
};


exports.resendVerificationEmail = (req, resp, next) => {
    const email = req.body.email;

    request({
        url: baseUrl+'/user/ResendVerificationEmail?email='+email,
        method: 'POST',
        json: true
      }, function (err, res, body) {
        console.log(body); 

        // call verify email 
        req.flash('success_msg', body.Details);
        resp.render('verify',{userdata:email});
    });

};


exports.saveNewUser = (req, resp, next) => {
    const {name, email, password} = req.body;
    resp.cookie('email', email);
    // generate random keys 
  const grk = randomize('0', 9)+ "-"+randomize('0a', 5);
  const device_id = grk+"~WEB~"+Date.now();

    request({
        headers: {
            'Content-Type': 'application/json'
          },
          url: baseUrl+'/user/userregistration',
          method: 'POST',
          body:{
            "name": name,
            "email": email,
            "password": password,
            "platform": "WEB",
            "os": "WINDOWS",
            "device_id": device_id,
            "firebase_account": 0,
            "firebase_id":"",
            "mc_version": "1.0",
            "firebase_token": ""
              },
        json: true
      }, function (err, res, body) {
        if (body.Status == 'Success') {
            //cerate new account in sql db
            console.log(body);   

           // send verification email 
           resp.render('verify',{userdata:body.user.email});
                               
        }else{
          console.log("user already exist");  
          req.flash('error_msg', 'Error! '+body.Details);
          resp.redirect('register'); 
        }
                                           
    });

};


exports.forgotPassword = (req, resp, next) => {
  const email = req.body.email;
  request({
    url: baseUrl+'/user/checkemail?email='+email,
    method: 'GET',
    json: true
  }, function (err, res, body) {
    console.log(body); 
    if (body.hasAccount == true) {
    console.log('has acc true');
     
    // password request 
    request({
      headers: {
          'Content-Type': 'application/json'
        },
        url: baseUrl+'/user/RequestPasswordReset',
        method: 'POST',
        body:{
          "email": email
            },
      json: true
    }, function (err, res, body) {
      if (body.Status == 'Success') {
        console.log(body.Status);   

       // send pass reset email 
       resp.render('verify_password_requset',{userdata:email});
                           
    }else{
      console.log("error sending reset email");  
    }

    });


    }else if (body.hasAccount == false) {
      console.log('have firebase account');
     // check with firebase

     request({
        url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key='+fireKey+'&email='+email+'&requestType=PASSWORD_RESET',
        method: 'POST',
      json: true
    }, function (err, res, body) {
      console.log(body);
      req.flash('success_msg', "Email sent successfully.");
      resp.redirect('login');
    });


    }
  });

};


exports.verifyPasswordCode = (req, resp, next) => {
  const {email,code} = req.body;
  console.log(email+' '+code);
  request({
      headers: {
          'Content-Type': 'application/json'
      },
      url: baseUrl+"/user/RequestPasswordCodeVerify",
      method: 'POST',
      body:{
          "email": email,
          "code": code
      },
      json: true
    }, function (err, res, body) {
      console.log(body); 
      if (body.Status =='Fail') {
          console.log(body.Details);
          // req.flash('error', body.Details);
          resp.render('verify_password_requset',{userdata:email,error_msg:'Invalid Code! Please try again.'});
      }else{
          resp.render('reset_password', {email: email, code: code});
      }
    });
};

exports.resetPassword = (req, resp) => {
  const {email, code, pass1, pass2} = req.body;

  if (pass1 != pass2) {
    resp.render('reset_password',{email:email,code:code, error_msg:"Passwords do not match"});
  }else{

    request({
      url: baseUrl+"/User/Setpassword",
      method: 'POST',
      body:{
        "email": email,
        "password": pass1,
        "code": code
      },
      json: true
    }, function (err, res, body) {
      console.log(body); 
      if (body.Status =='Fail') {
          console.log(body.Details);
          req.flash('error', body.Details);
          resp.render('reset_password',{emai:email,code:code, error_msg:body.Details});
      }else if(body.Status =='Success'){
          req.flash('success_msg', body.Details);
          resp.redirect('login');
      }
    });

  }
 
}



//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
    res.clearCookie("deviceID");
    res.clearCookie("accToken");
    res.clearCookie("email");
    req.logout();
    req.flash('success_msg', 'You are logged out');
    req.session.destroy();
    res.redirect('/auth/login');
}
