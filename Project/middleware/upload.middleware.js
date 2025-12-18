const multer = require("multer");
const path = require("path");

const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/products");
  },
  filename: function (req, file, cb) {
    const randomNamefile = "product-" + Date.now() + "-" + Math.round(Math.random() * 1e3);
    cb(null, randomNamefile + path.extname(file.originalname));
  },
});

const storageCategory = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/categories");
  },
  filename: function (req, file, cb) {
    const randomNamefile = "category-" + Date.now() + "-" + Math.round(Math.random() * 1e3);
    cb(null, randomNamefile + path.extname(file.originalname));
  },
});

const uploadImageProduct = multer({ storage: storageProduct });
const uploadImageCategory = multer({ storage: storageCategory });

const upload = {
  uploadImageProduct,
  uploadImageCategory,
};
module.exports = upload;
