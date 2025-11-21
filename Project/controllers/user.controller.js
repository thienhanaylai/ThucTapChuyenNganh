const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const getList = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const formattedUsers = users.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    res.render("admin/users", {
      users: formattedUsers,
      layout: "admin",
    });
  } catch (error) {
    res.send("Lỗi: " + error.message);
  }
};

const getAdd = (req, res) => {
  res.render("admin/users/addUser", { layout: "admin" });
};

const postAdd = async (req, res) => {
  try {
    const { username, password, fullname, phone, email, role } = req.body;

    // Hash mật khẩu trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
    await User.create({
      username,
      password: hashedPassword,
      fullname,
      phone,
      email,
      role,
    });

    res.redirect("/admin/users");
  } catch (error) {
    let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]; // trả về trường bị lỗi

      if (field === "email") {
        errorMessage =
          "Email này đã có người sử dụng, vui lòng chọn email khác.";
      } else if (field === "username") {
        errorMessage = "Username này đã tồn tại, vui lòng chọn tên khác.";
      } else if (field === "phone") {
        errorMessage = "Số điện thoại này đã được đăng ký.";
      } else {
        errorMessage = `Dữ liệu tại trường "${field}" bị trùng lặp.`;
      }
    } else if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      errorMessage = firstError;
    } else {
      errorMessage = error.message;
    }
    res.render("admin/users/addUser", {
      layout: "admin",
      error: errorMessage,
      oldData: req.body,
    });
  }
};

const getEdit = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.redirect("/admin/users");

    res.render("admin/users/editUser", {
      layout: "admin",
      user: user,
    });
  } catch (error) {
    res.redirect("/admin/users");
  }
};

const postUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...dataToUpdate } = req.body;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(password, salt);
    }

    await User.findByIdAndUpdate(id, dataToUpdate, { runValidators: true });

    res.redirect("/admin/users");
  } catch (error) {
    const user = await User.findById(req.params.id).lean();
    res.render("admin/users/edit", {
      layout: "admin",
      user: user,
      error: "Cập nhật thất bại: " + error.message,
    });
  }
};

const postDelete = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/users");
  } catch (error) {
    res.send("Lỗi xóa: " + error.message);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username }); //tìm nếu có user trong db thì tiếp tục
    if (!user) {
      return res.render("admin/login", {
        layout: false,
        error: "Tài khoản không tồn tại!",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password); //so sánh 2 chuỗi pass đã hash

    if (!isMatch) {
      return res.render("admin/login", {
        layout: false,
        error: "Mật khẩu không đúng!",
      });
    }

    if (user.role !== "admin") {
      //kiểm tra quyền admin
      return res.render("admin/login", {
        layout: false,
        error: "Không có quyền truy cập!",
      });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    return res.redirect("/admin");
  } catch (error) {
    res.render("admin/login", {
      layout: false,
      error: error,
    });
  }
};

module.exports = {
  getList,
  getAdd,
  postAdd,
  getEdit,
  postUpdate,
  postDelete,
  loginAdmin,
};
