const { check } = require('express-validator');
const usersRepo = require('../../repositories/users');

module.exports = {

    // auth validator

    requireEmail : check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid Email')
    .custom(async (email) => {
        const existingUser = await usersRepo.getOneBye({email})

        if(existingUser) {
            throw new Error('EMAIL IN USE')
        }
    }),

    requirePassword : check("password")
    .trim()
    .isLength({min:4,max:20})
    .withMessage('Must be between 4 and 20 characters'),

    requirePasswordConfirmation : check("passwordConfirmation")
    .trim()
    .isLength({min:4,max:20})
    .withMessage('Must be between 4 and 20 characters')
    .custom((passwordConfirmation, {req}) => {
        if(req.body.password !== passwordConfirmation) {
            throw new Error('PASSWORDS MUST MATCH')
        }
        return true;    
        // Without returning ture, It fails.
    }),

    requireEmailExists:   check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must Provide a Valid Email")
    .custom(async (email) => {
        const user = await usersRepo.getOneBye({email});

        if(!user) {
            throw new Error('EMAIL NOT FOUND');
        }
    }),

    requireValidPasswordForUser: check("password")
    .trim()
    .custom(async (password,{req}) => {
        const email = req.body.email;
        const user = await usersRepo.getOneBye({email});

        if(!user) throw new Error('INVALID PASSWORD💥');

        const validPassword = await usersRepo.comparePasswords(user.password,password);
    
        if(!validPassword) {
            throw new Error('INVALID PASSWORD💥');
        }
    }),

    //  products validator

    requireTitle: check('title')
    .trim()
    .isLength({min:5, max:40})
    .withMessage('Must be between 5 and 40 characters.'),

    requirePrice: check('price')
    .trim()
    .toFloat() // convert input value to Number.
    .isFloat({min:1}) // Check if it is a number. Min value is 1.
    .withMessage('Must be a number greater than 1.')
}
