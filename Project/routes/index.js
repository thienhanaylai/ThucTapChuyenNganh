var express = require("express");
const User = require("../models/user.model");
const Role = require("../models/role.model");
var router = express.Router();
const bcryptjs = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const Category = require("../models/category.model");
const Product = require("../models/product.model");

const requireLogin = (req, res, next) => {
  //midleware kiem tra login chua
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
};

const validateRegister = () => {
  return [
    body("fullname").notEmpty().withMessage("Tên không được để trống").trim(),
    body("email")
      .notEmpty()
      .withMessage("Email không được để trống")
      .isEmail()
      .withMessage("Email không đúng định dạng"),
    body("phone")
      .notEmpty()
      .withMessage("Số điện thoại không được để trống!")
      .isMobilePhone("vi-VN")
      .withMessage("Số điện thoại không hợp lệ!"),
    body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Mật khẩu không được để trống")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Mật khẩu xác nhận không trùng khớp!");
        }
        return true;
      }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      const ListError = errors.array().map((err) => err.msg);

      return res.status(400).render("home/register", {
        title: "Register",
        layout: false,
        error: ListError[0],
        oldData: req.body,
      });
    },
  ];
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
      let errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      const ListError = errors.array().map((err) => err.msg);

      return res.status(400).render("home/login", {
        title: "Login",
        layout: false,
        error: ListError[0],
        oldData: req.body,
      });
    },
  ];
};

router.all("/*", async function (req, res, next) {
  const categories = await Category.find({}).lean();
  res.locals.categories = categories;
  res.app.locals.layout = "home";
  next();
});

router.get("/register", (req, res) => {
  res.render("home/register", { title: "Register", layout: false });
});

router.post("/register", validateRegister(), async (req, res) => {
  const role = await Role.findOne({ name: "user" }); //truyền thẳng req.body.role vào đây nếu để cho người dùng chọn role
  const newUser = new User();
  newUser.fullname = req.body.fullname;
  newUser.email = req.body.email;
  newUser.phone = req.body.phone;
  newUser.password = req.body.password;
  newUser.role_id = role._id;
  bcryptjs.genSalt(10, function (err, salt) {
    bcryptjs.hash(newUser.password, salt, function (err, hash) {
      if (err) {
        return err;
      }
      newUser.password = hash;
      newUser
        .save()
        .then(() => {
          req.flash("success", "Đăng ký thành công !");
          res.redirect("/login");
        })
        .catch((error) => {
          let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
          if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; // trả về trường bị lỗi
            if (field === "email") {
              errorMessage =
                "Email này đã có người sử dụng, vui lòng chọn email khác.";
            } else if (field === "phone") {
              errorMessage = "Số điện thoại này đã được đăng ký.";
            } else {
              errorMessage = `"${field}" đã có người sử dụng.`;
            }
          } else if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            errorMessage = firstError;
          } else {
            errorMessage = error.message;
          }
          res.status(400).render("home/register", {
            layout: false,
            error: errorMessage,
            oldData: req.body,
          });
        });
    });
  });
});

router.get("/login", (req, res) => {
  res.render("home/login", { title: "Login", layout: false });
});

router.post("/login", validateLogin(), async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true, //thogn bao loi qua flash
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logOut((e) => {
    if (e) return next(e);
    res.redirect("/");
  });
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  let categories = await Category.find({}).lean();
  categories = await Promise.all(
    categories.map(async (cate) => {
      const quantity = await Product.countDocuments({ category_id: cate._id });
      return {
        ...cate,
        quantity: quantity,
      };
    })
  );

  const productList = await Product.find({}).limit(8).lean();
  res.render("home/index", {
    title: "Home",
    categories: categories,
    productList: productList,
  });
});

router.get("/shop", async function (req, res, next) {
  const categoryQuery = req.query.category;
  let filter = {};
  if (categoryQuery) {
    const categoryList = Array.isArray(categoryQuery)
      ? categoryQuery
      : [categoryQuery];
    const categoriesData = await Category.find({
      name: { $in: categoryList },
    }).lean();
    const categoryIds = categoriesData.map((cate) => cate._id);
    filter.category_id = { $in: categoryIds };
  }
  const productList = await Product.find(filter).lean();
  let categories = await Category.find({}).lean();
  categories = await Promise.all(
    categories.map(async (cate) => {
      const quantity = await Product.countDocuments({ category_id: cate._id });
      return {
        ...cate,
        quantity: quantity,
      };
    })
  );
  res.render("home/shop", {
    title: "Shop",
    categories: categories,
    productList: productList,
  });
});

router.get("/detail/:id", async function (req, res, next) {
  const product = await Product.findById(req.params.id).lean();
  res.render("home/detail", { title: "Detail", productDetail: product });
});

router.get("/contact", function (req, res, next) {
  res.render("home/contact", { title: "Contact" });
});

router.get("/cart", requireLogin, function (req, res, next) {
  console.log("User hiện tại:", req.user);
  res.render("home/cart", { title: "Cart" });
});

router.get("/checkout", requireLogin, function (req, res, next) {
  res.render("home/checkout", { title: "Checkout" });
});

module.exports = router;
