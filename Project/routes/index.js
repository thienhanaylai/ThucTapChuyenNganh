var express = require("express");
var router = express.Router();

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

router.all("/*", function (req, res, next) {
  res.app.locals.layout = "home";
  next();
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

router.get("/cart", function (req, res, next) {
  res.render("home/cart", { title: "Cart" });
});

router.get("/checkout", function (req, res, next) {
  res.render("home/checkout", { title: "Checkout" });
});

module.exports = router;
