const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const authRouter = require('./routes/admin/auth');
const productsRouter = require('./routes/admin/products');

const app = express();

app.use(express.static('public'));
// Find a "public" folder and make it available to outside.
// app.use(bodyParser.urlencoded({extended:true}));
app.use(express.urlencoded({extended:true}));
app.use(cookieSession({
    keys:['abcd1234']
    // cookie의 정보들을 암호화한다. 
}));

app.use(authRouter);
app.use(productsRouter);

app.listen(3000, () => {
    console.log('Listening !!');
})


