const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = new mongoose.Schema(
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
    brand: {
      type: String,
      ref: "Brand",
      required: true,
    },
    size: {
      type: String,
      required: true,
      enum: ["S", "M", "L", "XL", "XXL"],
    },
    color: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
