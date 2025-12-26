const bcryptjs = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");

const register = async (req, res) => {
  const newUser = new User();
  newUser.fullname = req.body.fullname;
  newUser.email = req.body.email;
  newUser.phone = req.body.phone;
  newUser.password = req.body.password;
  newUser.isAdmin = false;
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
        .catch(error => {
          let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
          if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; // trả về trường bị lỗi
            if (field === "email") {
              errorMessage = "Email này đã có người sử dụng, vui lòng chọn email khác.";
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
};

const login = async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true, //thong bao loi qua flash
  })(req, res, next);
};

const loginAdmin = async (req, res, next) => {
  passport.authenticate("admin", {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
    failureFlash: true, //thong bao loi qua flash
  })(req, res, next);
};

const logout = (req, res) => {
  req.logOut(e => {
    if (e) return next(e);
    res.redirect("/");
  });
};

const logoutAdmin = (req, res) => {
  req.logOut(e => {
    if (e) return next(e);
    res.redirect("/admin/login");
  });
};

const userLists = async (req, res, next) => {
  let users = await User.find({}).lean();
  users = users.map(user => {
    return {
      ...user,
      status: user.status === true ? "Hoạt động" : "Bị khóa",
    };
  });
  const currentUserID = req.user._id;
  res.render("admin/users", { users: users, currentUserID: currentUserID });
};

const userAdd = async (req, res, next) => {
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
          .catch(error => {
            let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
            if (error.code === 11000) {
              const field = Object.keys(error.keyValue)[0]; // trả về trường bị lỗi
              if (field === "email") {
                errorMessage = "Email này đã có người sử dụng, vui lòng chọn email khác.";
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
};

const userEdit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("admin/users/editUser", {
        error: errors.array()[0].msg,
        userEdit: userEdit,
      });
    }
    const userEdit = await User.findById(req.params.id).lean();
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
      .catch(error => {
        let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0]; // trả về trường bị lỗi
          if (field === "email") {
            errorMessage = "Email này đã có người sử dụng, vui lòng chọn email khác.";
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
};

const userDelete = async (req, res, next) => {
  try {
    if (req.user._id === req.params.id) {
      let errorMessage = "Không thể xoá tài khoản đang sử dụng!";
      let users = await User.find({}).lean();
      users = users.map(user => {
        return {
          ...user,
          status: user.status === true ? "Hoạt động" : "Bị khóa",
        };
      });
      return res.render("admin/users", {
        error: errorMessage,
        user: users,
      });
    }
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "Xoá thành công!");
    res.redirect("/admin/users");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/users");
  }
};

const profile = async (req, res, next) => {
  try {
    res.render("home/profile");
  } catch (e) {
    console.log(e);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("home/profile", {
        error: errors.array()[0].msg,
      });
    }
    const { fullname, email, phone } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fullname: fullname, email: email, phone: phone });
    req.flash("success", "Cập nhật thông tin thành công");
    return res.redirect("/profile");
  } catch (e) {
    console.log(e);
    req.flash("error", "Cập nhật thất bại!");
    return res.redirect("/profile");
  }
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("home/profile", {
        error: errors.array()[0].msg,
      });
    }
    let { password, oldPassword } = req.body;
    const user = await User.findById(req.user._id);
    const matched = await bcryptjs.compare(oldPassword, user.password);
    if (!matched) {
      req.flash("error", "Mật khẩu không chính xác!");
      return res.redirect("/profile");
    }
    const salt = await bcryptjs.genSalt(10);
    password = await bcryptjs.hash(password, salt);
    await User.findByIdAndUpdate(req.user._id, { password: password });
    req.flash("success", "Cập nhật mật khẩu thành công");
    return res.redirect("/profile");
  } catch (e) {
    console.log(e);
    req.flash("error", "Cập nhật thất bại!");
    return res.redirect("/profile");
  }
};

const user = {
  register,
  login,
  logout,
  loginAdmin,
  logoutAdmin,
  userLists,
  userAdd,
  userEdit,
  userDelete,
  profile,
  updateProfile,
  changePassword,
};

module.exports = user;
