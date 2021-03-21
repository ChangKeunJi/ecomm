const express = require("express");
const { validationResult } = require("express-validator");
const multer = require("multer");

const productsRepo = require("../../repositories/products");
const productsNewTemplate = require("../../views/admin/products/new");
const productsIndexTemplate = require("../../views/admin/products/index");
const productsEditTemplate = require("../../views/admin/products/edit");
const { requireTitle, requirePrice } = require("./validators");
const { handleErrors, requireAuth } = require("./middlewares");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//! Create Products

router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  // Now we get "title","price" in req.body
  // Multer attachs body & file object to req.
  [requireTitle, requirePrice],
  handleErrors(productsNewTemplate),
  async (req, res) => {
    // const errors = validationResult(req);
    // console.log(errors);

    // if(!errors.isEmpty()) {
    //     return res.send(productsNewTemplate({errors}));
    // }

    // if (!req.session.userId) {
    //   return res.redirect("/signin");
    // }

    const image = req.file.buffer.toString("base64");

    const { title, price } = req.body;

    await productsRepo.create({ title, price, image });

    res.redirect("/admin/products");
  }
);

router.get("/admin/products", requireAuth, async (req, res) => {
  // if (!req.session.userId) {
  //   return res.redirect("/signin");
  // }

  const products = await productsRepo.getAll();
  res.send(productsIndexTemplate({ products }));
});

//! Edit Products

router.get("/admin/products/:id/edit", requireAuth, async (req, res) => {
  const product = await productsRepo.getOne(req.params.id);

  if (!product) res.send("PRODUCT NOT FOUND!");

  res.send(productsEditTemplate({ product }));
});

router.post("/admin/products/:id/edit", requireAuth, async (req, res) => {});

router.get("/admin/products/new", (req, res) => {
  res.send(productsNewTemplate({}));
});

module.exports = router;
