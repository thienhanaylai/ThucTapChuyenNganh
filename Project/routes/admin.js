var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const Role = require("../models/role.model");
const checkAdmin = async (req, res, next) => {
  //check user có role admin ko nếu ko thì ko vào admin được
  if (req.isAuthenticated()) {
    const role = await Role.findById(req.user.role_id);
    if (role.name === "admin") next();
    else {
      res.send(
        `Bạn không có quyền truy cập trang này! Vui lòng đăng nhập tài khoản quản trị! <a href="/admin/login">Đăng nhập admin tại đây !</a>`
      );
    }
  } else {
    res.send(
      `Vui lòng đăng nhập tài khoản quản trị! <a href="/admin/login">Đăng nhập admin tại đây !</a>`
    );
  }
};

const validateLogin = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email không được để trống")
      .isEmail()
      .withMessage("Email không đúng định dạng"),
    body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      const ListError = errors.array().map((err) => err.msg);

      return res.status(400).render("admin/login", {
        title: "Login Dashboard",
        layout: false,
        error: ListError[0],
      });
    },
  ];
};

router.get("/login", function (req, res, next) {
  res.render("admin/login", { layout: false });
});

router.post("/loginAdmin", validateLogin(), async (req, res, next) => {
  passport.authenticate("admin", {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
    failureFlash: true, //thogn bao loi qua flash
  })(req, res, next);
});

// router.post("/loginAdmin", (req, res, next) => {
//   User.findOne({ username: req.body.username })
//     .then((user) => {
//       bcryptjs.compare(req.body.password, user.password, (e, result) => {
//         console.log(req.body);
//         if (e) res.send(e);
//         if (user.role != "admin") {
//           e = "Không có quyền truy cập!";
//           res.render("admin/login", {
//             title: "Login",
//             error: e,
//             layout: false,
//           });
//           return;
//         }
//         if (result) {
//           req.session.userId = user._id;
//           req.session.user = user;
//           res.redirect("/admin");
//         } else {
//           e = "Mật khẩu không chính xác!";
//           res.render("admin/login", {
//             title: "Login",
//             error: e,
//             layout: false,
//           });
//         }
//       });
//     })
//     .catch((e) => {
//       res.send(e);
//     });
// });

router.get("/logoutAdmin", (req, res) => {
  req.logOut((e) => {
    if (e) return next(e);
    res.redirect("/admin/login");
  });
});

router.all("/*", function (req, res, next) {
  res.app.locals.layout = "admin";
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
