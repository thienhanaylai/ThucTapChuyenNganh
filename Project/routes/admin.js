var express = require("express");
var router = express.Router();

const { validationResult } = require("express-validator");
const passport = require("passport");
const bcryptjs = require("bcryptjs");

const Category = require("../models/category.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");

const auth = require("../middleware/auth.middleware");
const validateForm = require("../middleware/validateForm.middleware");

const multer = require("multer");
const path = require("path");

const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/products");
  },
  filename: function (req, file, cb) {
    const randomNamefile =
      "product-" + Date.now() + "-" + Math.round(Math.random() * 1e3);
    cb(null, randomNamefile + path.extname(file.originalname));
  },
});

const storageCategory = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/categories");
  },
  filename: function (req, file, cb) {
    const randomNamefile =
      "category-" + Date.now() + "-" + Math.round(Math.random() * 1e3);
    cb(null, randomNamefile + path.extname(file.originalname));
  },
});

const uploadProduct = multer({ storage: storageProduct });
const uploadCategory = multer({ storage: storageCategory });

router.get("/login", function (req, res, next) {
  res.render("admin/login", { layout: false });
});

router.post(
  "/loginAdmin",
  validateForm.validateLoginAdmin(),
  async (req, res, next) => {
    passport.authenticate("admin", {
      successRedirect: "/admin",
      failureRedirect: "/admin/login",
      failureFlash: true, //thogn bao loi qua flash
    })(req, res, next);
  }
);

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

router.get("/", auth.checkAdmin, function (req, res, next) {
  res.render("admin");
});

router.get("/product", auth.checkAdmin, async function (req, res, next) {
  let products = await Product.find({}).lean();
  const categories = await Category.find({}).lean();
  products = products.map((product) => {
    const category = categories.find(
      //lấy tên cate từ cate_id
      (category) => category._id === product.category_id
    );
    console.log(category);
    return {
      ...product,
      categoryName: category ? category.name : "",
    };
  });
  res.render("admin/product", {
    products: products,
  });
});

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
  uploadProduct.single("image"),
  validateForm.validateAddProduct(),
  async function (req, res, next) {
    let { name, category_id, price, size, stock, description } = req.body;
    let imagePath = "";
    if (req.file) {
      imagePath = "images/products/" + req.file.filename;
    }
    try {
      const errors = validationResult(req);
      let details = [];
      if (Array.isArray(size)) {
        for (let i = 0; i < size.length; i++) {
          if (size[i] && stock[i]) {
            details.push({
              size: size[i],
              stock: stock[i],
            });
          }
        }
      } else {
        details.push({
          size: size,
          stock: stock,
        });
      }
      if (!errors.isEmpty()) {
        let categories = await Category.find({}).lean();
        categories = categories.map((cate) => {
          if (
            req.body.category_id &&
            cate._id.toString() === req.body.category_id.toString()
          ) {
            cate.isSelected = true;
          }
          return cate;
        });
        req.body.detail = details;
        return res.render("admin/product/addProduct", {
          error: errors.array()[0].msg,
          oldData: req.body,
          categories: categories,
        });
      }

      const newProduct = new Product();
      newProduct.name = name.replaceAll("-", " ");
      newProduct.category_id = category_id;
      newProduct.image = imagePath;
      newProduct.price = price;
      newProduct.description = description;
      newProduct.detail = details;
      await newProduct.save();

      return res.redirect("/admin/product");
    } catch (error) {
      let e = "Đã có lỗi!";
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        if (field === "name") {
          e = "Tên sản phẩm này đã tồn tại!";
        }
      }
      return res.status(400).render("admin/product/addProduct", { error: e });
    }
  }
);

router.get(
  "/product/edit/:id",
  auth.checkAdmin,
  async function (req, res, next) {
    const product = await Product.findById(req.params.id).lean();
    let categories = await Category.find({}).lean();
    categories = categories.map((cate) => {
      //lấy ra cate hiện tại của sản phẩm
      if (
        product.category_id &&
        cate._id.toString() === product.category_id.toString()
      ) {
        cate.isSelected = true;
      }
      return cate;
    });
    res.render("admin/product/editProduct", {
      oldData: product,
      categories: categories,
    });
  }
);

router.post(
  "/product/edit/:id",
  auth.checkAdmin,
  uploadProduct.single("image"),
  validateForm.validateEditProduct(),
  async function (req, res, next) {
    let { name, category_id, price, size, stock, description } = req.body;
    let product = await Product.findById(req.params.id).lean();
    let categories = await Category.find({}).lean();
    let imagePath = "";
    if (req.file) {
      imagePath = "images/products/" + req.file.filename;
    } else {
      imagePath = product.image;
    }

    let details = [];
    if (Array.isArray(size)) {
      for (let i = 0; i < size.length; i++) {
        if (size[i] && stock[i]) {
          details.push({
            size: size[i],
            stock: stock[i],
          });
        }
      }
    } else {
      details.push({
        size: size,
        stock: stock,
      });
    }

    categories = categories.map((cate) => {
      if (
        req.body.category_id &&
        cate._id.toString() === req.body.category_id.toString()
      ) {
        cate.isSelected = true;
      }
      return cate;
    });
    req.body.detail = details;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body._id = req.params.id;
        return res.render("admin/product/editProduct", {
          error: errors.array()[0].msg,
          oldData: req.body,
          categories: categories,
        });
      }
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: name,
          category_id: category_id,
          image: imagePath,
          price: price,
          description: description,
          detail: details,
        },
        { new: true }
      );
      return res.redirect("/admin/product");
    } catch (error) {
      let e = "Đã có lỗi!";
      console.log(error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        if (field === "name") {
          e = "Tên sản phẩm này đã tồn tại!";
        }
      }
      return res.status(400).render("admin/product/editProduct", {
        error: error,
        oldData: req.body,
        categories: categories,
      });
    }
  }
);

router.delete(
  "/product/delete/:id",
  auth.checkAdmin,
  async function (req, res, next) {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.redirect("/admin/product");
    } catch (e) {
      console.log(e);
      res.redirect("/admin/product");
    }
  }
);

router.get("/category", auth.checkAdmin, async function (req, res, next) {
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
  res.render("admin/category", { categories: categories });
});

router.get("/category/add", auth.checkAdmin, function (req, res, next) {
  res.render("admin/category/addCategory");
});

router.post(
  "/category/add",
  auth.checkAdmin,
  uploadCategory.single("logo"),
  async function (req, res, next) {
    const { categoryName } = req.body;

    if (!categoryName || categoryName.trim().length === 0) {
      const e = "Tên category không được để trống !";
      return res.status(400).render("admin/category/addCategory", { error: e });
    }
    let imagePath = "";
    if (req.file) {
      imagePath = "images/categories/" + req.file.filename;
    } else {
      const e = "Logo không được để trống !";
      return res.status(400).render("admin/category/addCategory", { error: e });
    }

    try {
      const category = new Category();
      category.name = req.body.categoryName;
      category.logo = imagePath;
      await category.save();
      return res.redirect("/admin/category");
    } catch (error) {
      let e = "Đã có lỗi ~";
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        if (field === "name") {
          e = "Tên category đã có!";
        }
      }
      return res.status(400).render("admin/category/addCategory", { error: e });
    }
  }
);

router.get(
  "/category/edit/:id",
  auth.checkAdmin,
  async function (req, res, next) {
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
  }
);

router.post(
  "/category/edit/:id",
  auth.checkAdmin,
  uploadCategory.single("logo"),
  async function (req, res, next) {
    const { categoryName } = req.body;
    if (!categoryName || categoryName.trim().length === 0) {
      const e = "Tên category không được để trống !";
      return res.render(`admin/category/editCategory/`, {
        error: e,
        categoryID: req.params.id,
      });
    }
    let imagePath = "";
    if (req.file) {
      imagePath = "images/categories/" + req.file.filename;
    } else {
      const cate = await Category.findById(req.params.id).lean();
      imagePath = cate.logo;
    }
    try {
      await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: categoryName,
          logo: imagePath,
        },
        { new: true }
      );
      return res.redirect("/admin/category");
    } catch (error) {
      let e = "Đã có lỗi ~";
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        if (field === "name") {
          e = "Tên category đã có!";
        }
      }
      return res.status(400).render("admin/category/editCategory", {
        error: e,
        categoryID: req.params.id,
      });
    }
  }
);

router.delete(
  "/category/delete/:id",
  auth.checkAdmin,
  async function (req, res) {
    try {
      await Category.findByIdAndDelete(req.params.id);
      res.redirect("/admin/category");
    } catch (e) {
      console.log(e);
      res.redirect("/admin/category");
    }
  }
);

router.get("/users", auth.checkAdmin, async function (req, res, next) {
  let users = await User.find({}).lean();
  users = users.map((user) => {
    return {
      ...user,
      status: user.status === true ? "Hoạt động" : "Bị khóa",
    };
  });
  console.log(users);
  res.render("admin/users", { user: users });
});

router.get("/users/add", auth.checkAdmin, async function (req, res, next) {
  res.render("admin/users/addUser");
});

router.post(
  "/users/add",
  auth.checkAdmin,
  validateForm.validateAddUser(),
  async function (req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("admin/users/addUser", {
          error: errors.array()[0].msg,
          oldData: req.body,
        });
      }
      const { fullname, email, phone, password, isAdmin, status } = req.body;
      const newUser = new User();
      newUser.fullname = fullname;
      newUser.email = email;
      newUser.phone = phone;
      newUser.password = password;
      newUser.isAdmin = isAdmin;
      newUser.status = status;
      bcryptjs.genSalt(10, function (err, salt) {
        bcryptjs.hash(newUser.password, salt, function (err, hash) {
          if (err) {
            return err;
          }
          newUser.password = hash;
          newUser
            .save()
            .then(() => {
              res.redirect("/admin/users");
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
              res.status(400).render("admin/users/addUser", {
                error: errorMessage,
                oldData: req.body,
              });
            });
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
);

router.get("/users/edit/:id", auth.checkAdmin, async function (req, res, next) {
  const user = await User.findById(req.params.id).lean();
  res.render("admin/users/editUser", { user: user });
});

router.post(
  "/users/edit/:id",
  auth.checkAdmin,
  validateForm.validateEditUser(),
  async function (req, res, next) {
    try {
      const errors = validationResult(req);
      const user = await User.findById(req.params.id).lean();
      if (!errors.isEmpty()) {
        return res.render("admin/users/editUser", {
          error: errors.array()[0].msg,
          user: user,
        });
      }
      let { fullname, email, phone, password, isAdmin, status } = req.body;

      if (!password || password.trim().length === 0) {
        //nếu ko thay đổi mk sẽ dùng lại mk cũ
        password = user.password;
      } else {
        //đợi hash password trước khi típ tục
        const salt = await bcryptjs.genSalt(10);
        password = await bcryptjs.hash(password, salt);
      }
      await User.findByIdAndUpdate(req.params.id, {
        fullname,
        email,
        phone,
        password,
        isAdmin,
        status,
      })
        .then(() => {
          res.redirect("/admin/users");
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
          res.status(400).render("admin/users/editUser", {
            roles: roles,
            error: errorMessage,
            oldData: req.body,
          });
        });
    } catch (e) {
      console.log(e);
    }
  }
);

router.delete("/users/delete/:id", auth.checkAdmin, async function (req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/users");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/users");
  }
});

module.exports = router;
