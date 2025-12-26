const { body, validationResult } = require("express-validator");

const validateRegister = () => {
  return [
    body("fullname").notEmpty().withMessage("Tên không được để trống").trim(),
    body("email").notEmpty().withMessage("Email không được để trống").isEmail().withMessage("Email không đúng định dạng"),
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
      const ListError = errors.array().map(err => err.msg);

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
    body("email").notEmpty().withMessage("Email không được để trống").isEmail().withMessage("Email không đúng định dạng"),
    body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
    (req, res, next) => {
      let errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      const ListError = errors.array().map(err => err.msg);

      return res.status(400).render("home/login", {
        title: "Login",
        layout: false,
        error: ListError[0],
        oldData: req.body,
      });
    },
  ];
};

const validateLoginAdmin = () => {
  return [
    body("email").notEmpty().withMessage("Email không được để trống").isEmail().withMessage("Email không đúng định dạng"),
    body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      const ListError = errors.array().map(err => err.msg);

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
    body("email").notEmpty().withMessage("Email không được để trống").isEmail().withMessage("Email không đúng định dạng"),
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
    body("isAdmin").notEmpty().withMessage("Vui lòng chọn role !"),
    body("status").notEmpty().withMessage("Vui lòng chọn trạng thái cho tài khoản !"),
  ];
};

const validateEditUser = () => {
  return [
    body("fullname").notEmpty().withMessage("Tên không được để trống").trim(),
    body("email").notEmpty().withMessage("Email không được để trống").isEmail().withMessage("Email không đúng định dạng"),
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
    body("isAdmin").notEmpty().withMessage("Vui lòng chọn role !"),
    body("status").notEmpty().withMessage("Vui lòng chọn trạng thái cho tài khoản !"),
  ];
};

const validateUpdateProfile = () => {
  return [
    body("fullname").notEmpty().withMessage("Tên không được để trống").trim(),
    body("phone")
      .notEmpty()
      .withMessage("Số điện thoại không được để trống!")
      .isMobilePhone("vi-VN")
      .withMessage("Số điện thoại không hợp lệ!"),
  ];
};

const validateUpdatePassword = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Mật khẩu cũ không được để trống"),
    body("password").notEmpty().withMessage("Mật khẩu mới không được để trống"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Mật khẩu xác nhận không được để trống")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Mật khẩu xác nhận không trùng khớp!");
        }
        return true;
      }),
  ];
};

const validateAddProduct = () => {
  return [
    body("name").notEmpty().withMessage("Tên sản phẩm không được để trống").trim(),
    body("category_id").notEmpty().withMessage("Brand không được để trống"),
    body("price").notEmpty().withMessage("Giá không được để trống!").isFloat().withMessage("Giá sản phẩm phải là số !"),
    body("size")
      .isArray({ min: 1 })
      .withMessage("Vui lòng nhập ít nhất 1 size")
      .custom(value => {
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
    body("description").notEmpty().withMessage("Vui lòng nhập thông tin mô tả!"),
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
    body("name").notEmpty().withMessage("Tên sản phẩm không được để trống").trim(),
    body("category_id").notEmpty().withMessage("Brand không được để trống"),
    body("price").notEmpty().withMessage("Giá không được để trống!").isFloat().withMessage("Giá sản phẩm phải là số !"),
    body("size")
      .isArray({ min: 1 })
      .withMessage("Vui lòng nhập ít nhất 1 size")
      .custom(value => {
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
    body("description").notEmpty().withMessage("Vui lòng nhập thông tin mô tả!"),
  ];
};

const validateForm = {
  validateRegister,
  validateLogin,
  validateLoginAdmin,
  validateAddUser,
  validateEditUser,
  validateAddProduct,
  validateEditProduct,
  validateUpdateProfile,
  validateUpdatePassword,
};

module.exports = validateForm;
