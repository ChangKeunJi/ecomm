const express = require('express');
const router = express.Router();
const {validationResult} = require('express-validator');

const productsRepo = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const {requireTitle, requirePrice} = require('./validators');

router.post('/admin/products/new',
[requireTitle,requirePrice]
,(req,res) => {
    const errors = validationResult(req);
    console.log(errors);
    res.send('Submitted')
});

router.get('/admin/products', (req,res) => {
    return res.send('products');
});

router.get('/admin/products/new',(req,res) => {
    res.send(productsNewTemplate({}))
});

module.exports = router;