var express = require("express");
var router = express.Router();

const Category = require("../models/category.model");

const user = require("../controller/user.controller");
const product = require("../controller/product.controller");
const category = require("../controller/category.controller");

const validateForm = require("../middleware/validateForm.middleware");

router.all("/*", async function (req, res, next) {
  const categories = await Category.find({}).lean();
  res.locals.categories = categories;
  res.app.locals.layout = "home";
  next();
});

router.get("/register", (req, res) => {
  res.render("home/register", { title: "Register", layout: false });
});

router.post("/register", validateForm.validateRegister(), user.register);

router.get("/login", (req, res) => {
  res.render("home/login", { title: "Login", layout: false });
});

router.post("/login", validateForm.validateLogin(), user.login);

router.get("/logout", user.logout);

router.get("/", product.productAndCate);

router.get("/shop", product.productAll);

router.get("/category", category.allCategoryShop);

router.get("/detail/:id", product.productDetail);

router.get("/contact", function (req, res, next) {
  res.render("home/contact", { title: "Contact" });
});

module.exports = router;
