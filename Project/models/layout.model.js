const mongoose = require("mongoose");

const layoutSettingSchema = new mongoose.Schema(
  {
    hotline: { type: String, default: "0917 580 860" },
    email: { type: String, default: "ngoboa025@gmail.com" },
    address: { type: String, default: "180 Cao Lo, Q8, HCM" },
    socials: {
      facebook: { type: String, default: "https://facebook.com" },
      instagram: { type: String, default: "https://instagram.com" },
      twitter: { type: String, default: "#" },
    },
    siteTitle: { type: String, default: "ShoeX Shop Online" },
    quickShops: {
      type: [
        {
          title: { type: String, default: "" },
          link: { type: String, default: "" },
        },
      ],
      default: [
        { title: "Home", link: "/" },
        { title: "Product", link: "/shop" },
      ],
    },
    myAccounts: {
      type: [
        {
          title: { type: String, default: "" },
          link: { type: String, default: "" },
        },
      ],
      default: [
        { title: "Login", link: "/login" },
        { title: "Register", link: "/register" },
      ],
    },
  },
  { timestamps: true }
);

layoutSettingSchema.statics.getSettings = async function () {
  const setting = await this.findOne();
  if (setting) {
    return setting;
  }
  return await this.create({
    hotline: "0917 580 860",
    email: "ngoboa025@gmail.com",
  });
};

layoutSettingSchema.pre("save", async function () {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({});
    if (count > 0) {
      throw new Error("Chỉ được phép tồn tại 1 cấu hình layout duy nhất!");
    }
  }
});

const layout = mongoose.model("Layout", layoutSettingSchema);
module.exports = layout;
