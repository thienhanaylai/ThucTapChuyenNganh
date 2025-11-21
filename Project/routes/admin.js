var express = require("express");
var router = express.Router();
const userController = require("../controllers/user.controller");
const brandController = require("../controllers/brand.controller");
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
  res.app.locals.user = req.session.user;
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

router.get("/category", brandController.getList);
router.get("/category/add", brandController.getAdd);
router.post("/category/add", brandController.postAdd);
router.get("/category/edit/:id", brandController.getEdit);
router.post("/category/edit/:id", brandController.postEdit);
router.post("/category/delete/:id", brandController.postDelete);

router.get("/orders", function (req, res, next) {
  res.render("admin/orders");
});

router.get("/users", userController.getList); // lấy danh sách user từ db
router.get("/users/add", userController.getAdd); //trả về form thêm user
router.post("/users/add", userController.postAdd); //thêm user vào db
router.post("/users/delete/:id", userController.postDelete); //xóa user theo id
router.get("/users/edit/:id", userController.getEdit); //trả về form sửa user theo id
router.post("/users/edit/:id", userController.postUpdate); //cập nhật user theo id
module.exports = router;
