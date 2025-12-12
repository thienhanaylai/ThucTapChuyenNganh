var express = require("express");
const User = require("../models/user.model");
var router = express.Router();
const bcryptjs = require("bcryptjs");

const productList = [
  {
    name: "Air Jordan 1 Low Golf White Aegean Storm",
    price: 123.0,
    sale: 153.0,
    rate: 3,
    reviews: 99,
    img: "img/Air-Jordan-1-Low-Golf-White-Aegean-Storm.jpg",
  },
  {
    name: "Air Jordan 1 Low TD Cleat Panda",
    price: 123.0,
    sale: 123.0,
    rate: 4,
    reviews: 99,
    img: "img/Air-Jordan-1-Low-TD-Cleat-Panda.jpg",
  },
  {
    name: "Crocs Classic Cozzzy Sandal Monsters Inc Sulley",
    price: 133.0,
    sale: 173.0,
    rate: 4,
    reviews: 99,
    img: "img/Crocs-Classic-Cozzzy-Sandal-Monsters-Inc-Sulley.jpg",
  },
  {
    name: "New Balance Numeric 933 Andrew Reynolds Black Olive",
    price: 143.0,
    sale: 183.0,
    rate: 4,
    reviews: 99,
    img: "img/New-Balance-Numeric-933-Andrew-Reynolds-Black-Olive.jpg",
  },
  {
    name: "Nike Manoa Haystack",
    price: 113.0,
    sale: 163.0,
    rate: 5,
    reviews: 99,
    img: "img/Nike-Manoa-Haystack.jpg",
  },
];

const productDetail = {
  name: "Air Jordan 1 Low Golf White Aegean Storm",
  price: 123.0,
  sale: 153.0,
  size: ["XS", "S", "M", "L", "XL"],
  colors: ["Black", "White", "Blue"],
  rate: 3,
  reviews: 99,
  img: "img/Air-Jordan-1-Low-Golf-White-Aegean-Storm.jpg", // có thể sẽ chuyển thành array để hiện thị thêm ảnh của giày
};

const requireLogin = (req, res, next) => {
  //midleware kiem tra login chua
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

router.all("/*", function (req, res, next) {
  res.app.locals.layout = "home";
  res.app.locals.user = req.session.user;
  next();
});

router.get("/register", (req, res) => {
  res.render("home/register", { title: "Register", layout: false });
});

router.post("/register", (req, res) => {
  const newUser = new User();
  newUser.fullname = req.body.fullname;
  newUser.username = req.body.username;
  newUser.email = req.body.email;
  newUser.phone = req.body.phone;
  newUser.password = req.body.password;
  bcryptjs.genSalt(10, function (err, salt) {
    bcryptjs.hash(newUser.password, salt, function (err, hash) {
      if (err) {
        return err;
      }
      newUser.password = hash;

      newUser
        .save()
        .then(() => {
          res.redirect("/login");
        })
        .catch((error) => {
          let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
          if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; // trả về trường bị lỗi
            if (field === "email") {
              errorMessage =
                "Email này đã có người sử dụng, vui lòng chọn email khác.";
            } else if (field === "username") {
              errorMessage = "Username này đã tồn tại, vui lòng chọn tên khác.";
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
          console.log(error);
          console.log(errorMessage);
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

router.post("/login", async (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .then((user) => {
      if (user) {
        bcryptjs.compare(req.body.password, user.password, (e, matched) => {
          if (e) res.send(e);
          if (matched) {
            req.session.userId = user._id;
            req.session.user = user;
            res.redirect("/");
          } else {
            e = "Mật khẩu không chính xác!";
            console.log(e);
            res.render("home/login", {
              title: "Login",
              error: e,
              layout: false,
            });
          }
        });
      } else {
        e = "Tài khoản không tồn tại!";
        console.log(e);
        res.render("home/login", {
          title: "Login",
          error: e,
          layout: false,
        });
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home/index", { title: "Home", productList: productList });
});

router.get("/shop", function (req, res, next) {
  res.render("home/shop", { title: "Shop", productList: productList });
});

router.get("/detail", function (req, res, next) {
  res.render("home/detail", { title: "Detail", productDetail: productDetail });
});

router.get("/contact", function (req, res, next) {
  res.render("home/contact", { title: "Contact" });
});

router.get("/cart", requireLogin, function (req, res, next) {
  res.render("home/cart", { title: "Cart" });
});

router.get("/checkout", requireLogin, function (req, res, next) {
  res.render("home/checkout", { title: "Checkout" });
});

module.exports = router;
