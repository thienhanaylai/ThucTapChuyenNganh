var express = require("express");
const User = require("../models/user.model");
var router = express.Router();
const bcryptjs = require("bcryptjs");

const checkAdmin = (req, res, next) => {
  //check user có role admin ko nếu ko thì ko vào admin được
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.send(
      `Bạn không có quyền truy cập trang này! Vui lòng đăng nhập tài khoản quản trị! <a href="/admin/login">Đăng nhập admin tại đây !</a>`
    );
  }
};

router.get("/login", function (req, res, next) {
  res.render("admin/login", { layout: false });
});

router.post("/loginAdmin", (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      bcryptjs.compare(req.body.password, user.password, (e, result) => {
        console.log(req.body);
        if (e) res.send(e);
        if (user.role != "admin") {
          e = "Không có quyền truy cập!";
          res.render("admin/login", {
            title: "Login",
            error: e,
            layout: false,
          });
          return;
        }
        if (result) {
          req.session.userId = user._id;
          req.session.user = user;
          res.redirect("/admin");
        } else {
          e = "Mật khẩu không chính xác!";
          res.render("admin/login", {
            title: "Login",
            error: e,
            layout: false,
          });
        }
      });
    })
    .catch((e) => {
      res.send(e);
    });
});

router.get("/logoutAdmin", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

router.all("/*", function (req, res, next) {
  res.app.locals.layout = "admin";
  res.app.locals.layout.user = req.session.user;
  next();
});

router.get("/", checkAdmin, function (req, res, next) {
  res.render("admin");
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
