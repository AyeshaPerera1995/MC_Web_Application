const express = require('express');
const router = express.Router();
const request = require('request');
const { ensureAuthenticated } = require('../config/checkAuth')

const baseUrl = require('../config/key').baseUrl;

router.get('/getAllClips', (req,resp) =>{
    // Get all account details
    var accToken = req.cookies.accToken;
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
         resp.render('clips', {accToken:accToken ,details:body});
    });
});


router.post('/getAllClips', ensureAuthenticated, (req,resp) =>{
    console.log('get all clips');
    const accToken = req.body.access_token;
    console.log(req.body);

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
         resp.render('clips', {accToken:accToken ,details:body});
    });
       
});

router.get('/getPinClips', ensureAuthenticated, (req,resp) =>{

    var accToken = req.cookies.accToken;
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
            req.flash('error_msg', 'Login Error!');
            resp.redirect('login'); 
         }
         resp.render('pin_clips', {accToken:accToken ,details:body});
    });
});

router.post('/getPinClips', ensureAuthenticated, (req,resp) =>{
    console.log('get fav clips');

    const accToken = req.body.access_token;
    console.log(req.body);

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
            req.flash('error_msg', 'Login Error!');
            resp.redirect('login'); 
         }
         resp.render('pin_clips', {accToken:accToken ,details:body});
    });
});

module.exports = router;