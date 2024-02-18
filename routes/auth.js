const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth_controller')

router.get('/login', (req, res) => res.render('login'));

router.post('/login', authController.loginHandle);

router.get('/resend_code', (req, res) => {
    const email = req.cookies.email;
    console.log(email);
    res.render('verify',{userdata:email})

});

router.post('/verify_code', authController.verifyCode);

router.get('/verify_code', (req, res) => res.render('verify'));

router.post('/resend_code', authController.resendVerificationEmail);

router.get('/register', (req,res) => res.render('registration'));

router.post('/register', authController.saveNewUser);

router.get('/forgot', (req,res) => res.render('forgot'));

router.post('/forgot', authController.forgotPassword);

router.post('/verify_password_code', authController.verifyPasswordCode);

router.get('/reset_password', (req,res) => res.render('reset_password'));

router.post('/resetPassword', authController.resetPassword);

router.get('/logout', authController.logoutHandle);

module.exports = router;