var express = require("express");
var router = express.Router();

router.all("/*", function (req, res, next) {
  res.app.locals.layout = "admin";
  next();
});

router.get("/", function (req, res, next) {
  res.render("admin");
});

router.get("/login", function (req, res, next) {
  res.render("admin/login");
});

router.get("/product", function (req, res, next) {
  res.render("admin/product");
});

router.get("/product/add", function (req, res, next) {
  res.render("admin/product/addProduct");
});

//edit sẽ truyền thêm id sản phẩm
router.get("/product/edit", function (req, res, next) {
  res.render("admin/product/editProduct");
});

router.get("/category", function (req, res, next) {
  res.render("admin/category");
});

router.get("/category/add", function (req, res, next) {
  res.render("admin/category/addCategory");
});

router.get("/category/edit", function (req, res, next) {
  res.render("admin/category/editCategory");
});

router.get("/orders", function (req, res, next) {
  res.render("admin/orders");
});
module.exports = router;
