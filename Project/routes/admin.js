var express = require("express");
var router = express.Router();

const checkAdmin = (req, res, next) => {
  //check user có role admin ko nếu ko thì ko vào admin được
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.send(
      "Bạn không có quyền truy cập trang này! Vui lòng đăng nhập tài khoản quản trị!"
    );
  }
};

router.all("/*", function (req, res, next) {
  res.app.locals.layout = "admin";
  next();
});

router.get("/", checkAdmin, function (req, res, next) {
  res.render("admin");
});

router.get("/login", function (req, res, next) {
  res.render("admin/login");
});

router.get("/product", checkAdmin, function (req, res, next) {
  res.render("admin/product");
});

router.get("/product/add", checkAdmin, function (req, res, next) {
  res.render("admin/product/addProduct");
});

//edit sẽ truyền thêm id sản phẩm
router.get("/product/edit", checkAdmin, function (req, res, next) {
  res.render("admin/product/editProduct");
});

router.get("/category", checkAdmin, function (req, res, next) {
  res.render("admin/category");
});

router.get("/category/add", checkAdmin, function (req, res, next) {
  res.render("admin/category/addCategory");
});

router.get("/category/edit", checkAdmin, function (req, res, next) {
  res.render("admin/category/editCategory");
});

router.get("/orders", checkAdmin, function (req, res, next) {
  res.render("admin/orders");
});

module.exports = router;
