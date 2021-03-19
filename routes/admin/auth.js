const express = require('express');
const usersRepo = require('../../repositories/users');
const {validationResult} = require('express-validator');

const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const {
    requireEmail, 
    requirePassword,
    requirePasswordConfirmation,
    requireEmailExists,
    requireValidPasswordForUser
    } = require('./validators');

const router = express.Router(); // sub-router
// 일종의 또다른 sub app. router와 연결시킨뒤 index.js에 있는 app에 붙여준다. 

router.post(
    '/signup'
    ,[
    requireEmail,
    requirePassword,
    requirePasswordConfirmation
],
    async (req,res) => {

    const errors = validationResult(req);

    // console.log(errors) looks like below
    /*
    Result {
        formatter: [Function: formatter],
        errors: [
          {
            value: 'test1@test.com',
            msg: 'EMAIL IN USE',
            param: 'email',
            location: 'body'
          },
          {
            value: '2',
            msg: 'Must be between 4 and 20 characters',
            param: 'password',
            location: 'body'
          },
          {
            value: '2',
            msg: 'Must be between 4 and 20 characters',
            param: 'passwordConfirmation',
            location: 'body'
          },
          {
            value: '2',
            msg: 'Invalid value',
            param: 'passwordConfirmation',
            location: 'body'
          }
        ]
      }
    */
    
    if(!errors.isEmpty()) {
        return res.send(signupTemplate({req, errors}));
    }

    const {email,password} = req.body;

    // req.body looks like below
    /*
    {
        email: 'test4@test.com',
        password: '44444',
        passwordConfirmation: '44444'
    }
    */

    const user = await usersRepo.create({email,password});

    req.session.userId = user.id;
    //: Added by cookie session 

    res.send('ACCOUNT CREATED');
}) 

router.post('/signin',[
    requireEmailExists,requireValidPasswordForUser
    ],async (req,res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return  res.send(signinTemplate({errors:errors}));
    }

    const {email} = req.body;

    const user = await usersRepo.getOneBye({email});

    req.session.userId = user.id;

    res.send('YOU ARE SINGED IN');

})

router.get('/signup',(req,res) => {
    res.send(signupTemplate({req}));
});

router.get('/signin',(req,res) => {
    res.send(signinTemplate({}));
})

router.get('/signout',(req,res) => {
    req.session = null;

    res.send('You are logged out')
})



module.exports = router;