var express = require("express");
var router = express.Router();

const upload = require("../middleware/upload.middleware");

const Category = require("../models/category.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");

const user = require("../controller/user.controller");
const product = require("../controller/product.controller");
const category = require("../controller/category.controller");

const auth = require("../middleware/auth.middleware");
const validateForm = require("../middleware/validateForm.middleware");
const layout = require("../models/layout.model");
const { updateLayoutSettings } = require("../controller/layout.controller");

router.get("/login", function (req, res, next) {
  res.render("admin/login", { layout: false });
});

router.post("/loginAdmin", validateForm.validateLoginAdmin(), user.loginAdmin);

router.get("/logoutAdmin", user.logoutAdmin);

router.all("/*", function (req, res, next) {
  res.app.locals.layout = "admin";
  next();
});

router.get("/", auth.checkAdmin, async function (req, res, next) {
  const totalProduct = await Product.find({}).countDocuments();
  const totalCategory = await Category.find({}).countDocuments();
  const totalUser = await User.find({}).countDocuments();

  const newProducts = await Product.find().sort({ createdAt: -1 }).limit(6).lean();
  const newCategories = await Category.find().sort({ createdAt: -1 }).limit(6).lean();
  const newUsers = await User.find().sort({ createdAt: -1 }).limit(6).lean();
  res.render("admin", {
    totalCategory: totalCategory,
    totalProduct: totalProduct,
    totalUser: totalUser,
    newProducts: newProducts,
    newCategories: newCategories,
    newUsers: newUsers,
  });
});

router.get("/product", auth.checkAdmin, product.getAllProduct);

router.get("/product/add", auth.checkAdmin, async function (req, res, next) {
  const categories = await Category.find({}).lean();
  res.render("admin/product/addProduct", {
    title: "Add Product",
    categories: categories,
  });
});

router.post(
  "/product/add",
  auth.checkAdmin,
  upload.uploadImageProduct.single("image"),
  validateForm.validateAddProduct(),
  product.productAdd
);

router.get("/product/edit/:id", auth.checkAdmin, async function (req, res, next) {
  const product = await Product.findById(req.params.id).lean();
  let categories = await Category.find({}).lean();
  categories = categories.map(cate => {
    //lấy ra cate hiện tại của sản phẩm
    if (product.category_id && cate._id.toString() === product.category_id.toString()) {
      cate.isSelected = true;
    }
    return cate;
  });
  res.render("admin/product/editProduct", {
    oldData: product,
    categories: categories,
  });
});

router.post(
  "/product/edit/:id",
  auth.checkAdmin,
  upload.uploadImageProduct.single("image"),
  validateForm.validateEditProduct(),
  product.productEdit
);

router.post("/product/updateStatus/:id", auth.checkAdmin, product.updateStatusProduct);

router.delete("/product/delete/:id", auth.checkAdmin, product.productDelete);

router.get("/category", auth.checkAdmin, category.allCategory);

router.get("/category/add", auth.checkAdmin, function (req, res, next) {
  res.render("admin/category/addCategory");
});

router.post("/category/add", auth.checkAdmin, upload.uploadImageCategory.single("logo"), category.categoryAdd);

router.get("/category/edit/:id", auth.checkAdmin, async function (req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.render("admin/category/editCategory", {
        categoryID: category._id,
        categoryName: category.name,
      });
    } else {
      return res.redirect("/admin/category");
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/category/edit/:id", auth.checkAdmin, upload.uploadImageCategory.single("logo"), category.categoryEdit);

router.post("/category/updateStatus/:id", auth.checkAdmin, category.updateStatusCategory);

router.delete("/category/delete/:id", auth.checkAdmin, category.categoryDelete);

router.get("/users", auth.checkAdmin, user.userLists);

router.get("/users/add", auth.checkAdmin, async function (req, res, next) {
  res.render("admin/users/addUser");
});

router.post("/users/add", auth.checkAdmin, validateForm.validateAddUser(), user.userAdd);

router.get("/users/edit/:id", auth.checkAdmin, async function (req, res, next) {
  const user = await User.findById(req.params.id).lean();
  res.render("admin/users/editUser", { userEdit: user });
});

router.post("/users/edit/:id", auth.checkAdmin, validateForm.validateEditUser(), user.userEdit);

router.delete("/users/delete/:id", auth.checkAdmin, user.userDelete);

router.get("/layout", auth.checkAdmin, async function (req, res, next) {
  try {
    const settings = await layout.getSettings();
    res.render("admin/layout", {
      settings: settings.toObject(),
    });
  } catch (err) {
    console.log(err);
    res.redirect("/admin/dashboard");
  }
});

router.post("/layout", auth.checkAdmin, validateForm.validateLayoutSetting(), updateLayoutSettings);
module.exports = router;
