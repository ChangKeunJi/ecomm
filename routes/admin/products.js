const express = require("express");
const { validationResult } = require("express-validator");
const multer = require("multer");

const productsRepo = require("../../repositories/products");
const productsNewTemplate = require("../../views/admin/products/new");
const { requireTitle, requirePrice } = require("./validators");
const { handleErrors } = require("./middlewares");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/admin/products/new",
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

    const image = req.file.buffer.toString("base64");

    const { title, price } = req.body;

    await productsRepo.create({ title, price, image });

    res.send("Submitted");
  }
);

router.get("/admin/products", async (req, res) => {
  const products = await productsRepo.getAll();
});

router.get("/admin/products/new", (req, res) => {
  res.send(productsNewTemplate({}));
});

module.exports = router;
