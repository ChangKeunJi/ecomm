const express = require('express');
const usersRepo = require('../../repositories/users');
const {check, validationResult} = require('express-validator');

const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');

const router = express.Router(); // sub-router
// 일종의 또다른 sub app. router와 연결시킨뒤 index.js에 있는 app에 붙여준다. 

router.post(
    '/signup'
    ,[
    check("email").trim().normalizeEmail().isEmail(),
    check("password").trim().isLength({min:4,max:20}),
    check("passwordConfirmation").trim().isLength({min:4,max:20})
],
    async (req,res) => {

    const error = validationResult(req);
    console.log(error);

    const {email,password,passwordConfirmation} = req.body;

    const existingUser = await usersRepo.getOneBye({email})

    if(existingUser) {
        return res.send('EMAIL IN USE');
    }

    if(password !== passwordConfirmation) {
        return res.send('PASSWORDS MUST MATCH')
    }

    // Create a user in user repo to represent this person

    const user = await usersRepo.create({email,password});

    // Store the id of that user inside the users cookie

    req.session.userId = user.id;
    //: Added by cookie session 

    res.send('ACCOUNT CREATED');
}) 

router.get('/signup',(req,res) => {
    res.send(signupTemplate({req}));
});

router.get('/signout',(req,res) => {
    req.session = null;

    res.send('You are logged out')
})

router.get('/signin',(req,res) => {
    res.send(signinTemplate());
})

router.post('/signin',async (req,res) => {

    const {email,password} = req.body;

    const user = await usersRepo.getOneBye({email});

    if(!user) {
        return res.send('EMAIL NOT FOUND');
    }

    const validPassword = await usersRepo.comparePasswords(user.password,password);

    if(!validPassword) {
        return res.send('INVALID PASSWORD');
    }

    req.session.userId = user.id;

    res.send('YOU ARE SINGED IN');

})

module.exports = router;