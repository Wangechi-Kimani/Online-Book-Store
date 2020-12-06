
const express = require('express');
const {  validationResult } = require('express-validator')

const Product = require('../models/product');
const fileHelper = require('../util/file');


//Add Product -> GET Function
exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "admin/addproduct",
      editing: false,
      hasError: false,
      product: {
          title: '',
          price: '',
          author: '',
          genre: '',
          description: '',
          imageUrl: ''
      },
      errorMessage: null,
      validationErrors: []
    });
};

//Add Product -> POST Function
exports.postAddProduct = async (req, res, next) => {
    const title =  req.body.title;
    const price =  req.body.price;
    const author = req.body.author;
    const genre = req.body.genre;
    const desc = req.body.description;
    const image = req.file;
    if(!image) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "admin/addproduct",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                author: author,
                genre: genre,
                description: desc,
            },
            errorMessage: 'Selected file is not an image',
            validationErrors: []
          });
    }

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "admin/addproduct",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                author: author,
                genre: genre,
                description: desc
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
          });
    }

    const imageUrl = image.path;
    const product = new Product({
        title: title,
        price: price,
        author: author,
        genre: genre,
        description: desc,
        imageUrl: imageUrl,
        userId: req.user
    });
    try {
    await product.save();
    res.redirect('/admin/products');
    // product.save()
    // .then(product => {
    //     // console.log(product);
    //     res.redirect('/admin/products');
    // })
    }
    catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);        
    }
}

//Edit Product -> GET Function
exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      product: product,
      editing: editMode,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
  // Product.findById({ _id: prodId })
  //     .then(product => {
  //         if(!product) {
  //             return res.redirect('/');
  //         }
  //         res.render('admin/edit-product', {
  //             pageTitle: 'Edit Product',
  //             path: '/admin/edit-product',
  //             product: product,
  //             editing: editMode,
  //             hasError: false,
  //             errorMessage: null,
  //             validationErrors: []
  //         })
  //         // const product = products[0]
  //         // console.log(product);
  //         // res.redirect('/');
  //     })
  //     .catch(err => {
  //         const error = new Error(err);
  //         error.httpStatusCode = 500;
  //         return next(error);
  //     })
};

//Edit Product - POST Method
exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedAuthor = req.body.author;
  const updatedGenre = req.body.genre;
  const updatedDesc = req.body.description;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "admin/addproduct",
      editing: true,
      hasError: true,
      product: {
        _id: prodId,
        title: updatedTitle,
        price: updatedPrice,
        author: updatedAuthor,
        genre: updatedGenre,
        description: updatedDesc,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  try {
    const product = await Product.findById(prodId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.author = updatedAuthor;
    product.genre = updatedGenre;
    product.description = updatedDesc;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  // Product.findById(prodId)
  //     .then(product => {
  //         if(product.userId.toString() !== req.user._id.toString()) {
  //             return res.redirect('/');
  //         }
  //         product.title = updatedTitle;
  //         product.price = updatedPrice;
  //         product.author = updatedAuthor;
  //         product.genre = updatedGenre;
  //         product.description = updatedDesc
  //         if(image) {
  //             fileHelper.deleteFile(product.imageUrl);
  //             product.imageUrl = image.path;
  //         }
  //         return product.save().then(result => {
  //             // console.log(`PRODUCT UPDATED`);
  //             res.redirect('/admin/products');
  //         })
  //     })
  //     .catch(err => {
  //         const error = new Error(err);
  //         error.httpStatusCode = 500;
  //         return next(error);
  //     });
};

//Get ALL Admin Products
exports.getProducts = async (req, res, next) => {
    try {
       const products =  await Product.find({userId: req.user._id});
       res.render('admin/products', {
           pageTitle: 'ALL Products',
           path: '/admin/products',
           prods: products
       })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
    // Product.find({userId: req.user._id})
    //   .then((products) => {
    //     // console.log(products);
    //     res.render("admin/products", {
    //       pageTitle: "All Products",
    //       prods: products,
    //       path: "/admin/products"
    //     });
    //   })
    //   .catch((err) => {
    //     const error = new Error(err);
    //     error.httpStatusCode = 500;
    //     return next(error);
    //   });
}

//Delete Product
exports.deleteProduct = async(req, res, next) => {
  const prodId = req.params.productId;
  try{
      const product = await Product.findById(prodId);
      if(!product) {
          return next(new Error('No product found'))
      }
      fileHelper.deleteFile(product.imageUrl);
      await Product.deleteOne({id: prodId, userId: req.user._id});
      console.log(`Product deleted successfully`);
      res.status(200).json({message: 'Sussess!'});
  } catch(err) {
    res.status(500).json({message: 'Deleting product failed'}); 
  }
//   Product.findById(prodId)
//     .then((product) => {
//       if (!product) {
//         return next(new Error("No product found!"));
//       }
//       fileHelper.deleteFile(product.imageUrl);
//       return Product.deleteOne({ _id: prodId, userId: req.user._id });
//     })
//     .then((result) => {
//       console.log(`Product deleted successfully`);
//       res.status(200).json({message: 'Sussess!'});
//     })
//     .catch((err) => {
//       res.status(500).json({message: 'Deleting product failed'});
//     });
};