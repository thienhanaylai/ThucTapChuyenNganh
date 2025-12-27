const Layout = require("../models/layout.model");
const { validationResult } = require("express-validator");
const updateLayoutSettings = async (req, res) => {
  try {
    const settings = await Layout.getSettings();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("admin/layout", {
        error: errors.array()[0].msg,
        settings: settings.toObject(),
      });
    }
    const data = req.body;

    settings.siteTitle = data.siteTitle;
    settings.hotline = data.hotline;
    settings.email = data.email;
    settings.address = data.address;

    settings.socials = {
      facebook: data.facebook,
      instagram: data.instagram,
      twitter: data.twitter,
    };

    if (data.quickShops) {
      settings.quickShops = data.quickShops.filter(
        item => item.title && item.title.trim() !== "" && item.link && item.link.trim() !== ""
      );
    } else {
      settings.quickShops = [];
    }
    if (data.myAccounts) {
      settings.myAccounts = data.myAccounts.filter(
        item => item.title && item.title.trim() !== "" && item.link && item.link.trim() !== ""
      );
    } else {
      settings.myAccounts = [];
    }
    await settings.save();

    res.redirect("back");
  } catch (error) {
    console.error("Lỗi cập nhật Layout:", error);
    res.status(500).send("Đã xảy ra lỗi khi lưu cài đặt.");
  }
};

const getLayout = async (req, res, next) => {
  try {
    const settings = await Layout.getSettings();
    res.locals.settings = settings.toObject();
    next();
  } catch (error) {
    console.error("Lỗi lấy layout settings:", error);
    next();
  }
};

const layouts = {
  updateLayoutSettings,
  getLayout,
};

module.exports = layouts;
