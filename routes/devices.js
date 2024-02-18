const express = require('express');
const router = express.Router();
const request = require('request');
const { ensureAuthenticated } = require('../config/checkAuth')

const baseUrl = require('../config/key').baseUrl;

router.get('/getDevices', ensureAuthenticated, (req,resp) =>{

var accToken = req.cookies.accToken;
var cookie_id = req.cookies.deviceID;
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
     resp.render('devices', {accToken:accToken ,details:body, cookie_id:cookie_id});
});

});

router.post('/getDevices', ensureAuthenticated, (req,resp) =>{
    console.log('get all devices');
    const accToken = req.body.access_token;
    console.log(req.body);
    var cookie_id = req.cookies.deviceID;
    console.log(cookie_id);

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
         resp.render('devices', {accToken:accToken ,details:body, cookie_id:cookie_id});
    });
       
});

module.exports = router;