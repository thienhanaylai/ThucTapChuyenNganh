const Product = require("../models/product.model");
const Category = require("../models/category.model");
const { validationResult } = require("express-validator");

const productAndCate = async (req, res, next) => {
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
  const productList = await Product.find({}).limit(8).lean();
  res.render("home/index", {
    title: "Home",
    categories: categories,
    productList: productList,
  });
};

const productAll = async (req, res, next) => {
  const categoryQuery = req.query.category;
  let filter = {};
  if (categoryQuery) {
    const categoryList = Array.isArray(categoryQuery) ? categoryQuery : [categoryQuery];
    const categoriesData = await Category.find({
      name: { $in: categoryList },
    }).lean();
    const categoryIds = categoriesData.map(cate => cate._id);
    filter.category_id = { $in: categoryIds };
  }
  const productList = await Product.find(filter).lean();
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
  res.render("home/shop", {
    title: "Shop",
    categories: categories,
    productList: productList,
  });
};

const productDetail = async (req, res, next) => {
  const product = await Product.findById(req.params.id).lean();
  res.render("home/detail", { title: "Detail", productDetail: product });
};

const getAllProduct = async (req, res, next) => {
  let products = await Product.find({}).lean();
  const categories = await Category.find({}).lean();
  products = products.map(product => {
    const category = categories.find(
      //lấy tên cate từ cate_id
      category => category._id === product.category_id
    );
    console.log(category);
    return {
      ...product,
      categoryName: category ? category.name : "",
    };
  });
  res.render("admin/product", {
    products: products,
  });
};

const productAdd = async (req, res, next) => {
  let { name, category_id, price, size, stock, description } = req.body;
  let imagePath = "";
  if (req.file) {
    imagePath = "images/products/" + req.file.filename;
  }
  try {
    const errors = validationResult(req);
    let details = [];
    if (Array.isArray(size)) {
      for (let i = 0; i < size.length; i++) {
        if (size[i] && stock[i]) {
          details.push({
            size: size[i],
            stock: stock[i],
          });
        }
      }
    } else {
      details.push({
        size: size,
        stock: stock,
      });
    }
    if (!errors.isEmpty()) {
      let categories = await Category.find({}).lean();
      categories = categories.map(cate => {
        if (req.body.category_id && cate._id.toString() === req.body.category_id.toString()) {
          cate.isSelected = true;
        }
        return cate;
      });
      req.body.detail = details;
      return res.render("admin/product/addProduct", {
        error: errors.array()[0].msg,
        oldData: req.body,
        categories: categories,
      });
    }

    const newProduct = new Product();
    newProduct.name = name.replaceAll("-", " ");
    newProduct.category_id = category_id;
    newProduct.image = imagePath;
    newProduct.price = price;
    newProduct.description = description;
    newProduct.detail = details;
    await newProduct.save();

    return res.redirect("/admin/product");
  } catch (error) {
    let e = "Đã có lỗi!";
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      if (field === "name") {
        e = "Tên sản phẩm này đã tồn tại!";
      }
    }
    return res.status(400).render("admin/product/addProduct", { error: e });
  }
};

const productEdit = async (req, res, next) => {
  let { name, category_id, price, size, stock, description } = req.body;
  let product = await Product.findById(req.params.id).lean();
  let categories = await Category.find({}).lean();
  let imagePath = "";
  if (req.file) {
    imagePath = "images/products/" + req.file.filename;
  } else {
    imagePath = product.image;
  }

  let details = [];
  if (Array.isArray(size)) {
    for (let i = 0; i < size.length; i++) {
      if (size[i] && stock[i]) {
        details.push({
          size: size[i],
          stock: stock[i],
        });
      }
    }
  } else {
    details.push({
      size: size,
      stock: stock,
    });
  }

  categories = categories.map(cate => {
    if (req.body.category_id && cate._id.toString() === req.body.category_id.toString()) {
      cate.isSelected = true;
    }
    return cate;
  });
  req.body.detail = details;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.body._id = req.params.id;
      return res.render("admin/product/editProduct", {
        error: errors.array()[0].msg,
        oldData: req.body,
        categories: categories,
      });
    }
    await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        category_id: category_id,
        image: imagePath,
        price: price,
        description: description,
        detail: details,
      },
      { new: true }
    );
    return res.redirect("/admin/product");
  } catch (error) {
    let e = "Đã có lỗi!";
    console.log(error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      if (field === "name") {
        e = "Tên sản phẩm này đã tồn tại!";
      }
    }
    return res.status(400).render("admin/product/editProduct", {
      error: error,
      oldData: req.body,
      categories: categories,
    });
  }
};

const productDelete = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/product");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/product");
  }
};

const product = {
  productAndCate,
  productAll,
  productDetail,
  getAllProduct,
  productAdd,
  productEdit,
  productDelete,
};
module.exports = product;
