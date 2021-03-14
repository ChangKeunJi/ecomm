const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const usersRepo = require('./repositories/users')

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
    keys:['abcd1234']
    // 쉽게 COOKIE정보를 획들하고 변경할 수 있기에
    // random string을 암호화한다 
    // cookiesession이 대신 암호화해서 USER 이외 사람의 접근을
    // 막는다. 
}));

app.post('/signup',async (req,res) => {

    console.log(req.body);

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

    
    // .session is a Object added by cookieSession

    req.session.userId = user.id;

    res.send('ACCOUNT CREATED');
}) 

app.get('/signup',(req,res) => {
    res.send(`
        <div>
            Your ID is : ${req.session.userId}
            <form method="POST">
                <input name="email" placeholder="email" />
                <input name="password" placeholder="password" />
                <input name="passwordConfirmation" placeholder="password confirmation" />
                <button>Sign Up</button>
            </form>
        </div>
    `);
});

app.get('/signout',(req,res) => {
    req.session = null;

    res.send('You are logged out')
})

app.get('/signin',(req,res) => {
    res.send(`
    <div>
        <form method="POST">
            <input name="email" placeholder="email" />
            <input name="password" placeholder="password" />
            <button>Sign In</button>
        </form>
    </div>
    `)
})

app.post('/signin',async (req,res) => {

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

app.listen(3000, () => {
    console.log('Listening !!');
})


