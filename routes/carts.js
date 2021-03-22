const express = require("express");

const cartsRepo = require("../repositories/carts");

const router = express.Router();

// Receive a POST request to add an item to a cart

router.post("/cart/products", async (req, res) => {
  // Figure out the cart

  let cart;
  if (!req.session.cartId) {
    // Need to create one & Store cartId on req.session.cartId

    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    // Get it from repository

    cart = await cartsRepo.getOne(req.session.cartId);
  }

  console.log(cart);

  // Either increment quantity for existing product
  // OR add new product to items array

  res.send("Product Added!!");
});

// Receive a GET request to show all the items in cart

// Receive a POST request to delete an item from a cart

module.exports = router;
