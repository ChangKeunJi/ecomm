const express = require("express");

const cartsRepo = require("../repositories/carts");
const productRepo = require("../repositories/products");
const cartShowTemplate = require("../views/carts/show");

const router = express.Router();

//! Receive a POST request to add an item to a cart

router.post("/cart/products", async (req, res) => {
  // 1) Figure out the cart

  let cart;
  if (!req.session.cartId) {
    // Need to create one & Store cartId on req.session.cartId

    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    // Get it from repository

    cart = await cartsRepo.getOne(req.session.cartId);
  }

  // 2) Either increment quantity for existing product
  // OR add new product to items array

  const existingItem = cart.items.find(
    (item) => req.body.productId === item.id
  );

  if (existingItem) {
    // increment quantity and save cart
    existingItem.quantity++;
  } else {
    // add new product id to items array
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }

  await cartsRepo.update(cart.id, {
    items: cart.items,
  });

  res.redirect("/cart");
});

//! Receive a GET request to show all the items in cart

router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect("/");
  }

  const cart = await cartsRepo.getOne(req.session.cartId);

  for (let item of cart.items) {
    const product = await productRepo.getOne(item.id);

    item.product = product;
  }

  // Modified cart object won't be updated in JSON.

  // res.send("CART LIST");
  res.send(cartShowTemplate({ items: cart.items }));
});

//! Receive a POST request to delete an item from a cart

router.post("/cart/products/delete", async (req, res) => {
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter((item) => {
    return item.id !== req.body.itemId;
  });

  await cartsRepo.update(cart.id, { items });

  res.redirect("/cart");
});

module.exports = router;
