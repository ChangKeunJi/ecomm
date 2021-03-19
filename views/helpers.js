module.exports = {
    getError(errors,prop) {

        // prop === email or password or passwordConfirmation


        /*
        errors.mapped() === {
            email: {...},
            password: {...},
            passwordConfirmation:{...}
        }
        */

        // Whatever the reason is, when we got errors, 
        // It'll move to error block
        
        try {
            return errors.mapped()[prop].msg;
        } catch(err) {
            return "";
        }

    }
};