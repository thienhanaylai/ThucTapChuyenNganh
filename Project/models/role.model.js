const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const roleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      require: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
