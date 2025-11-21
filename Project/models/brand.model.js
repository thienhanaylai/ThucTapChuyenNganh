const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const brandSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
