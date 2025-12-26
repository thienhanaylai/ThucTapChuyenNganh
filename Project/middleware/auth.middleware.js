const checkAdmin = async (req, res, next) => {
  //check user có phair admin ko nếu ko thì ko vào admin được
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) next();
    else {
      res.send(
        `Bạn không có quyền truy cập trang này! Vui lòng đăng nhập tài khoản quản trị! <a href="/admin/login">Đăng nhập admin tại đây !</a>`
      );
    }
  } else {
    res.send(`Vui lòng đăng nhập tài khoản quản trị! <a href="/admin/login">Đăng nhập admin tại đây !</a>`);
  }
};

const auth = {
  checkAdmin,
};

module.exports = auth;
