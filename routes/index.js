const express = require('express');
const router = express.Router();
const request = require('request');
const { ensureAuthenticated } = require('../config/checkAuth')

const baseUrl = require('../config/key').baseUrl;

require('dotenv').config();

router.get('/',(req,res)=>{
    res.render('home');
});

router.get('/data',(req,res)=>{
    res.render('data');
});
router.get('/contact',(req,res)=>{
    res.render('contact');
});
router.get('/terms',(req,res)=>{
    res.render('terms');
});

router.get('/dashboard', ensureAuthenticated, (req,resp)=>{
    const accToken = req.user.access_token;
    console.log(req.user.device_id);
    resp.cookie('deviceID', req.user.device_id);
    resp.cookie('accToken', accToken);

    // Get all account details
    request({
        headers: {
            'AccessToken': accToken
        },
        url: baseUrl+'/User/checkAccountDetails',
        method: 'GET',
        json: true
    }, function (err, res, body) {
        // console.log(body);
        if (err) { 
            req.flash('error_msg', 'Login Error!');
            resp.redirect('login'); 
         }
         resp.render('dashboard', {accToken:accToken ,details:body, cookie_id:req.user.device_id, basic_key:process.env.BASIC_PRICE_ID, pre_key:process.env.PRE_PRICE_ID});
    
    });

});



router.get('/Windows', (req,resp)=>{   
    resp.render('windowsdownload');
});


router.get('/subscribe', (req,resp)=>{   
    resp.send('You have successfully unsubscribed from our email list. You will no longer receive product updates and announcements.');
});


router.get('/xmasOffer', (req,resp)=>{   
    resp.render('xmas');
});


module.exports = router;
