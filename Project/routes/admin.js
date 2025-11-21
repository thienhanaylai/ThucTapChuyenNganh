var express = require("express");
var router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/login", function (req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect("/admin");
  }
  res.render("admin/login", { layout: false });
});

router.get("/logout", function (req, res, next) {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

router.post("/login", userController.loginAdmin);

router.use("/*", function (req, res, next) {
  //nếu chưa đăng nhập sẽ trả về trang login
  if (!req.session || !req.session.user) {
    return res.redirect("/admin/login");
  }
  res.app.locals.layout = "admin";
  next();
});

router.get("/", function (req, res, next) {
  res.render("admin");
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

router.get("/users", userController.getList); // lấy danh sách user từ db
router.get("/users/add", userController.getAdd);
router.post("/users/add", userController.postAdd);

module.exports = router;
