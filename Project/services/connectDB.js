const mongoose = require("mongoose");
const uri =
  "mongodb+srv://thienhanaylai:wDlupvhB9FgxJX9j@cluster0.dmsd4gt.mongodb.net/shop_test?appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

module.exports = connectDB;
