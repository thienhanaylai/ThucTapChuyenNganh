const Category = require("../models/category.model");
const Product = require("../models/product.model");

const allCategory = async function (req, res, next) {
  let categories = await Category.find({}).lean();
  categories = await Promise.all(
    categories.map(async cate => {
      const quantity = await Product.countDocuments({ category_id: cate._id });
      return {
        ...cate,
        quantity: quantity,
      };
    })
  );
  res.render("admin/category", { categories: categories });
};

const allCategoryShop = async function (req, res, next) {
  let categories = await Category.find({}).lean();
  categories = await Promise.all(
    categories.map(async cate => {
      const quantity = await Product.countDocuments({ category_id: cate._id });
      return {
        ...cate,
        quantity: quantity,
      };
    })
  );
  res.render("home/category", { categories: categories });
};

const categoryAdd = async (req, res, next) => {
  const { categoryName } = req.body;

  if (!categoryName || categoryName.trim().length === 0) {
    const e = "Tên category không được để trống !";
    return res.status(400).render("admin/category/addCategory", { error: e });
  }
  let imagePath = "";
  if (req.file) {
    imagePath = "images/categories/" + req.file.filename;
  } else {
    const e = "Logo không được để trống !";
    return res.status(400).render("admin/category/addCategory", { error: e });
  }

  try {
    const category = new Category();
    category.name = req.body.categoryName;
    category.logo = imagePath;
    await category.save();
    return res.redirect("/admin/category");
  } catch (error) {
    let e = "Đã có lỗi ~";
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      if (field === "name") {
        e = "Tên category đã có!";
      }
    }
    return res.status(400).render("admin/category/addCategory", { error: e });
  }
};

const categoryEdit = async (req, res, next) => {
  const { categoryName } = req.body;
  if (!categoryName || categoryName.trim().length === 0) {
    const e = "Tên category không được để trống !";
    return res.render(`admin/category/editCategory/`, {
      error: e,
      categoryID: req.params.id,
    });
  }
  let imagePath = "";
  if (req.file) {
    imagePath = "images/categories/" + req.file.filename;
  } else {
    const cate = await Category.findById(req.params.id).lean();
    imagePath = cate.logo;
  }
  try {
    await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: categoryName,
        logo: imagePath,
      },
      { new: true }
    );
    return res.redirect("/admin/category");
  } catch (error) {
    let e = "Đã có lỗi ~";
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      if (field === "name") {
        e = "Tên category đã có!";
      }
    }
    return res.status(400).render("admin/category/editCategory", {
      error: e,
      categoryID: req.params.id,
    });
  }
};

const categoryDelete = async (req, res) => {
  try {
    let numberProduct = await Product.find({ category_id: req.params.id }).countDocuments();
    if (numberProduct) {
      req.flash("error", "Đang có sản phẩm thuộc category này không thể xoá!");
      return res.redirect("/admin/category");
    }
    await Category.findByIdAndDelete(req.params.id);
    req.flash("success", "Xoá thành công!");
    return res.redirect("/admin/category");
  } catch (e) {
    console.log(e);
    return res.redirect("/admin/category");
  }
};

const category = {
  allCategory,
  categoryAdd,
  categoryEdit,
  categoryDelete,
  allCategoryShop,
};

module.exports = category;
