var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const Role = require("../models/role.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
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

router.get("/orders", checkAdmin, function (req, res, next) {
  res.render("admin/orders");
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

      if (password) {
        bcryptjs.genSalt(10, function (err, salt) {
          bcryptjs.hash(password, salt, function (err, hash) {
            if (err) {
              return err;
            }
            password = hash;
          });
        });
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
