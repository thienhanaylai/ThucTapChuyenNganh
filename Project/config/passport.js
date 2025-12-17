const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const passport = require("passport");
const Role = require("../models/role.model");

module.exports = function configPassport() {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email });
          if (!user) {
            return done(null, false, { message: "Không tồn tại tài khoản." });
          }
          if (!user.status) {
            return done(null, false, {
              message: "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên!",
            });
          }
          const matched = await bcrypt.compare(password, user.password);
          if (matched) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Mật khẩu không chính xác!" });
          }
        } catch (e) {
          return done(e);
        }
      }
    )
  );
  passport.use(
    "admin",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email });
          if (!user) {
            return done(null, false, { message: "Không tồn tại tài khoản." });
          }
          const role = await Role.findById(user.role_id);
          if (role.name !== "admin") {
            return done(null, false, { message: "Không có quyền truy cập!" });
          }
          if (!user.status) {
            return done(null, false, {
              message: "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên!",
            });
          }
          const matched = await bcrypt.compare(password, user.password);
          if (matched) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Mật khẩu không chính xác!" });
          }
        } catch (e) {
          return done(e);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
