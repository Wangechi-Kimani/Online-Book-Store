const express = require('express');
const { check, body } = require("express-validator");

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  "/login",
  [
    check("email")
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail()
        .trim(), //express validator method to remove excess whitespace
    body("password")
        .isAlphanumeric()
        .isLength({ min: 5 }).withMessage("Password must be a minimum of five characters")
        .trim()
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post(
  "/signup",
  [
    check('email')
        .isEmail().withMessage("Email must be a valid Email")
        .custom(value => {
           return User.findOne({email: value}).then(user => {
                if(user) {
                    return Promise.reject(`Email ${value} already exists`);
                };
            });
        })
        .normalizeEmail()
        .trim(),
    body('password')
        .isAlphanumeric().withMessage('Password must contain numbers and letters')
        .isLength({min: 5}).withMessage('Password must be a minimum of five characters')
        .trim(),
    body('confirmPassword')
        .custom((value, { req })=> {
            if(value !== req.body.password) {
                throw new Error('Password confimation does not match password');
            }
            //Indictates the success of this synchronous custom validator
            return true;
        })
  ],
  authController.postSignUp
);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;