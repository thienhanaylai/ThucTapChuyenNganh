const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model"); // Đảm bảo đường dẫn đúng đến file model của bạn

// Thay tên database của bạn vào đây
const MONGO_URI =
  "mongodb+srv://thienhanaylai:wDlupvhB9FgxJX9j@cluster0.dmsd4gt.mongodb.net/shop_test?appName=Cluster0";

const seedDB = async () => {
  try {
    // 1. Kết nối DB
    await mongoose.connect(MONGO_URI);
    console.log("🌱 Đã kết nối MongoDB...");

    // 2. Tạo mật khẩu mã hóa chung cho cả 2 (Password là: 123456)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 3. Dữ liệu mẫu
    const users = [
      {
        username: "admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        fullname: "Quản Trị Viên",
        phone: "0901234567", // Phải đúng regex: 10 số, bắt đầu bằng 0
        role: "admin",
        cart: [],
      },
      {
        username: "testuser",
        email: "user@gmail.com",
        password: hashedPassword,
        fullname: "Khách Hàng Mẫu",
        phone: "0987654321",
        role: "user",
        cart: [],
      },
    ];

    // 4. Duyệt qua và lưu vào DB (Kiểm tra trùng lặp)
    for (const user of users) {
      // Kiểm tra xem user đã tồn tại chưa (theo username hoặc email)
      const existUser = await User.findOne({
        $or: [{ username: user.username }, { email: user.email }],
      });

      if (!existUser) {
        await User.create(user);
        console.log(
          `✅ Đã tạo tài khoản: ${user.username} | Pass: 123456 | Role: ${user.role}`
        );
      } else {
        console.log(`⚠️ Tài khoản ${user.username} đã tồn tại, bỏ qua.`);
      }
    }

    console.log("🎉 Hoàn tất tạo dữ liệu mẫu!");
    process.exit(); // Thoát chương trình sau khi chạy xong
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
};

// Chạy hàm
seedDB();
