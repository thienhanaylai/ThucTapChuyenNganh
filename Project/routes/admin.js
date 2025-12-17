var express = require("express");
var router = express.Router();

const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcryptjs = require("bcryptjs");

const Role = require("../models/role.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const ProductDetail = require("../models/productDetail.model");

const multer = require("multer");
const path = require("path");

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

const validateAddUser = () => {
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
    body("role_id").notEmpty().withMessage("Vui lòng chọn role !"),
    body("status")
      .notEmpty()
      .withMessage("Vui lòng chọn trạng thái cho tài khoản !"),
  ];
};

const validateEditUser = () => {
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
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Mật khẩu xác nhận không trùng khớp!");
      }
      return true;
    }),
    body("role_id").notEmpty().withMessage("Vui lòng chọn role !"),
    body("status")
      .notEmpty()
      .withMessage("Vui lòng chọn trạng thái cho tài khoản !"),
  ];
};

const validateAddProduct = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Tên sản phẩm không được để trống")
      .trim(),
    body("category_id").notEmpty().withMessage("Brand không được để trống"),
    body("price")
      .notEmpty()
      .withMessage("Giá không được để trống!")
      .isFloat()
      .withMessage("Giá sản phẩm phải là số !"),
    body("size")
      .isArray({ min: 1 })
      .withMessage("Vui lòng nhập ít nhất 1 size")
      .custom((value) => {
        if (!value) return true;
        const unique = new Set(value); //Set đảm bảo size ko bị trùng
        if (unique.size !== value.length) {
          throw new Error("Danh sách Size không được trùng lặp!");
        }
        return true;
      }),
    body("size.*")
      .notEmpty()
      .withMessage("Size không được để trống")
      .isInt({ gt: 37 })
      .withMessage("Size sản phẩm phải là số và lớn hơn 37 !"),
    body("stock.*")
      .notEmpty()
      .withMessage("Vui lòng nhập số lương sản phẩm")
      .isInt({ gt: 0 })
      .withMessage("Vui lòng nhập só lượng hợp lệ!"),
    body("description")
      .notEmpty()
      .withMessage("Vui lòng nhập thông tin mô tả!"),
    body("image").custom((value, { req }) => {
      //kiemt ra da upload file len chúa
      if (!req.file) {
        throw new Error("Vui lòng upload ảnh cho sản phẩm !");
      }
      return true;
    }),
  ];
};

const validateEditProduct = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Tên sản phẩm không được để trống")
      .trim(),
    body("category_id").notEmpty().withMessage("Brand không được để trống"),
    body("price")
      .notEmpty()
      .withMessage("Giá không được để trống!")
      .isFloat()
      .withMessage("Giá sản phẩm phải là số !"),
    body("size")
      .isArray({ min: 1 })
      .withMessage("Vui lòng nhập ít nhất 1 size")
      .custom((value) => {
        if (!value) return true;
        const unique = new Set(value); //Set đảm bảo size ko bị trùng
        if (unique.size !== value.length) {
          throw new Error("Danh sách Size không được trùng lặp!");
        }
        return true;
      }),
    body("size.*")
      .notEmpty()
      .withMessage("Size không được để trống")
      .isInt({ gt: 37 })
      .withMessage("Size sản phẩm phải là số và lớn hơn 37 !"),
    body("stock.*")
      .notEmpty()
      .withMessage("Vui lòng nhập số lương sản phẩm")
      .isInt({ gt: 0 })
      .withMessage("Vui lòng nhập só lượng hợp lệ!"),
    body("description")
      .notEmpty()
      .withMessage("Vui lòng nhập thông tin mô tả!"),
  ];
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/products");
  },
  filename: function (req, file, cb) {
    const randomNamefile =
      "product-" + Date.now() + "-" + Math.round(Math.random() * 1e3);
    cb(null, randomNamefile + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

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

router.get("/product", checkAdmin, async function (req, res, next) {
  let products = await Product.find({}).lean();
  const categories = await Category.find({}).lean();
  products = products.map((product) => {
    const category = categories.find(
      //lấy tên cate từ cate_id
      (category) => category._id === product.category_id
    );
    return {
      ...product,
      categoryName: category.name,
    };
  });
  res.render("admin/product", {
    products: products,
  });
});

router.get("/product/add", checkAdmin, async function (req, res, next) {
  const categories = await Category.find({}).lean();
  res.render("admin/product/addProduct", {
    title: "Add Product",
    categories: categories,
  });
});

router.post(
  "/product/add",
  checkAdmin,
  upload.single("image"),
  validateAddProduct(),
  async function (req, res, next) {
    let { name, category_id, price, size, stock, description } = req.body;
    let imagePath = "";
    if (req.file) {
      imagePath = "/public/images/products/" + req.file.filename;
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
      newProduct.name = name;
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

router.get("/product/edit/:id", checkAdmin, async function (req, res, next) {
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
});

router.post(
  "/product/edit/:id",
  checkAdmin,
  upload.single("image"),
  validateEditProduct(),
  async function (req, res, next) {
    let { name, category_id, price, size, stock, description } = req.body;
    let product = await Product.findById(req.params.id).lean();
    let categories = await Category.find({}).lean();
    let imagePath = "";
    if (req.file) {
      imagePath = "/public/images/products/" + req.file.filename;
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
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        if (field === "name") {
          e = "Tên sản phẩm này đã tồn tại!";
        }
      }
      return res.status(400).render("admin/product/editProduct", {
        error: e,
        oldData: req.body,
        categories: categories,
      });
    }
  }
);

router.delete(
  "/product/delete/:id",
  checkAdmin,
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

router.get("/category", checkAdmin, async function (req, res, next) {
  const categories = await Category.find({}).lean();
  res.render("admin/category", { categories: categories });
});

router.get("/category/add", checkAdmin, function (req, res, next) {
  res.render("admin/category/addCategory");
});

router.post("/category/add", checkAdmin, async function (req, res, next) {
  const { categoryName } = req.body;
  if (!categoryName || categoryName.trim().length === 0) {
    const e = "Tên category không được để trống !";
    return res.status(400).render("admin/category/addCategory", { error: e });
  } else {
    try {
      const category = new Category();
      category.name = req.body.categoryName;
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
});

router.get("/category/edit/:id", checkAdmin, async function (req, res, next) {
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

router.post("/category/edit/:id", checkAdmin, async function (req, res, next) {
  const { categoryName } = req.body;
  if (!categoryName || categoryName.trim().length === 0) {
    const e = "Tên category không được để trống !";
    return res.render(`admin/category/editCategory/`, {
      error: e,
      categoryID: req.params.id,
    });
  } else {
    try {
      await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: categoryName,
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
});

router.delete("/category/delete/:id", checkAdmin, async function (req, res) {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect("/admin/category");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/category");
  }
});

router.get("/users", checkAdmin, async function (req, res, next) {
  let users = await User.find({}).lean();
  const roles = await Role.find({}).lean();

  users = users.map((user) => {
    const role = roles.find((role) => role._id === user.role_id);
    return {
      ...user,
      status: user.status === true ? "Hoạt động" : "Bị khóa",
      role_name: role ? role.name : "Chưa cấp quyền",
    };
  });
  res.render("admin/users", { user: users });
});

router.get("/users/add", checkAdmin, async function (req, res, next) {
  const roles = await Role.find({}).lean();
  res.render("admin/users/addUser", { roles: roles });
});

router.post(
  "/users/add",
  checkAdmin,
  validateAddUser(),
  async function (req, res, next) {
    try {
      const errors = validationResult(req);
      const roles = await Role.find({}).lean();
      if (!errors.isEmpty()) {
        return res.render("admin/users/addUser", {
          roles: roles,
          error: errors.array()[0].msg,
          oldData: req.body,
        });
      }
      const { fullname, email, phone, password, role_id, status } = req.body;
      const newUser = new User();
      newUser.fullname = fullname;
      newUser.email = email;
      newUser.phone = phone;
      newUser.password = password;
      newUser.role_id = role_id;
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
                roles: roles,
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

router.get("/users/edit/:id", checkAdmin, async function (req, res, next) {
  let roles = await Role.find({}).lean();
  const user = await User.findById(req.params.id).lean();
  roles = roles.map((role) => {
    return {
      ...role,
      isSelected: role._id === user.role_id,
    };
  });
  res.render("admin/users/editUser", { user: user, roles: roles });
});

router.post(
  "/users/edit/:id",
  checkAdmin,
  validateEditUser(),
  async function (req, res, next) {
    try {
      const errors = validationResult(req);
      const roles = await Role.find({}).lean();
      const user = await User.findById(req.params.id).lean();
      if (!errors.isEmpty()) {
        return res.render("admin/users/editUser", {
          roles: roles,
          error: errors.array()[0].msg,
          user: user,
        });
      }
      let { fullname, email, phone, password, role_id, status } = req.body;

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
        role_id,
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

router.delete("/users/delete/:id", checkAdmin, async function (req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/users");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/users");
  }
});

module.exports = router;
