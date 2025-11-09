var express = require("express");
var router = express.Router();
router.all("/*", function (req, res, next) {
  res.app.locals.layout = "home";
  next();
});
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home/index", { title: "Home" });
});

router.get("/shop", function (req, res, next) {
  res.render("home/shop", { title: "Shop" });
});

router.get("/detail", function (req, res, next) {
  res.render("home/detail", { title: "Detail" });
});

router.get("/contact", function (req, res, next) {
  res.render("home/contact", { title: "Contact" });
});

router.get("/cart", function (req, res, next) {
  res.render("home/cart", { title: "Cart" });
});

router.get("/checkout", function (req, res, next) {
  res.render("home/checkout", { title: "Checkout" });
});

module.exports = router;
