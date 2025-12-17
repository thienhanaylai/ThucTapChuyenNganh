const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productDetailSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    product_id: {
      type: String,
      ref: "Product",
    },
    size: {
      type: Number,
      min: 1,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const ProductDetail = mongoose.model("ProductDetail", productDetailSchema);
module.exports = ProductDetail;
