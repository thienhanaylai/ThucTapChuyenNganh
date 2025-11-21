const Brand = require("../models/brand.model");

const getList = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 }).lean();
    const formattedBrands = brands.map((brand) => ({
      ...brand,
      createdAt: new Date(brand.createdAt).toLocaleString("en-GB", {
        //set lại định dạng ngày tháng
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    res.render("admin/category", { brands: formattedBrands, layout: "admin" });
  } catch (error) {
    res.send("Lỗi: " + error.message);
  }
};

const getAdd = async (req, res) => {
  res.render("admin/category/addCategory", { layout: "admin" });
};

const postAdd = async (req, res) => {
  try {
    const { name } = req.body;

    await Brand.create({
      name,
    });

    res.redirect("/admin/category");
  } catch (error) {}
};

const getEdit = async (req, res) => {
  try {
    const id = req.params.id;
    const brand = await Brand.findById(id).lean();
    if (!brand) {
      return res.redirect("/admin/category");
    }
    res.render("admin/category/editCategory", {
      brand,
      layout: "admin",
    });
  } catch (e) {
    res.redirect("/admin/category");
  }
};

const postEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const { brandName } = req.body;
    await Brand.findByIdAndUpdate(
      id,
      { name: brandName },
      {
        runValidators: true,
      }
    );
    console.log(name);
    res.redirect("/admin/category");
  } catch (e) {
    res.redirect("/admin/category");
  }
};

const postDelete = async (req, res) => {
  try {
    const id = req.body.id;
    await Brand.findOneAndDelete(id);
    res.redirect("/admin/category");
  } catch (e) {
    res.send("Lỗi khi xoá: " + e.message);
  }
};
module.exports = {
  getList,
  getAdd,
  postAdd,
  getEdit,
  postEdit,
  postDelete,
};
