const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const braintree = require('braintree');

//import local files
const Product = require('../models/product');
const Order = require('../models/order');
const { exec } = require('child_process');
const product = require('../models/product');

const ITEMS_PER_PAGE = 2;

//Function to output the current month
let getMonthName = () => {
    let monthNames = ["January", "February", "March", "April", "May","June","July", "August", "September", "October", "November","December"];

    let date = new Date();
    let month = monthNames[date.getMonth()];  
    return month;
}


//Index Controller
exports.getIndex = (req, res, next) => {
        let month = getMonthName();
        res.render("shop/index", {
          pageTitle: "Online Store",
          month: month,
          path: "/"
        });
}


// Get All Products
exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1; //the or sign(pipe) fixes the NaN error
  let totalItems;

  try {
    const numProducts = await Product.find().countDocuments();
    totalItems = numProducts;
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/products", {
      pageTitle: "All Products",
      prods: products,
      path: "/products",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  // Product.find()
  //   .countDocuments()
  //   .then((numProducts) => {
  //     totalItems = numProducts;
  //     return Product.find()
  //       .skip((page - 1) * ITEMS_PER_PAGE)
  //       .limit(ITEMS_PER_PAGE);
  //   })
  //   .then((products) => {
  //     // console.log(products);
  //     res.render("shop/products", {
  //       pageTitle: "All Products",
  //       prods: products,
  //       path: "/products",
  //       currentPage: page,
  //       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
  //       hasPreviousPage: page > 1,
  //       nextPage: page + 1,
  //       previousPage: page - 1,
  //       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
  //     });
  //   })
  //   .catch((err) => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};

//Get a single Product
exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;

  try {
    const product = await Product.findById(prodId);
    res.render("shop/product-detail", {
      pageTitle: "Product Detail",
      product: product,
      path: "/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  // Product.findById(prodId)
  //     .then(product => {
  //         res.render("shop/product-detail", {
  //           pageTitle: "Product Detail",
  //           product: product,
  //           path: "/products"
  //         });
  //     })
  //     .catch(err => {
  //       const error = new Error(err);
  //       error.httpStatusCode = 500;
  //       return next(error);
  //     });
};



//Cart Controller
exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
         res.render("shop/cart", {
           pageTitle: "Your Cart",
           path: "/cart",
           products: products
         });
  } catch (err) {
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }
 
  //  req.user
  //    .populate("cart.items.productId")
  //    .execPopulate()
  //    .then((user) => {
  //      const products = user.cart.items;
  //      res.render("shop/cart", {
  //        pageTitle: "Your Cart",
  //        path: "/cart",
  //        products: products
  //      });
  //    })
  //    .catch(err => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });

    // res.render('shop/cart', {pageTitle: 'Cart', path: '/cart'});
}

exports.postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      const product = await Product.findById(prodId);
      await req.user.addToCart(product);
      res.redirect("/cart");
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
   

    // Product
    //   .findById(prodId)
    //   .then(product => {
    //     return req.user.addToCart(product);
    //   })
    //   .then(result => {
    //     res.redirect('/cart')
    //   })
    //   .catch(err => {
    //     const error = new Error(err);
    //     error.httpStatusCode = 500;
    //     return next(error);
    //   });
  };

  exports.postCartDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      await req.user.removeFromCart(prodId);
      console.log('Cart Deleted successfully');
      res.redirect("/cart");
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  
    // req.user
    //   .removeFromCart(prodId)
    //   .then(result => {
    //     res.redirect('/cart');
    //   })
    //   .catch(err => {
    //     const error = new Error(err);
    //     error.httpStatusCode = 500;
    //     return next(error);
    //   });
  };

  exports.getOrders = async (req, res, next) => {
    try {
      const orders = await Order.find({ "user.userId": req.user._id });
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    // Order.find({ "user.userId": req.user._id })
    // .then(orders => {
    //   res.render('shop/orders', {
    //     path: '/orders',
    //     pageTitle: 'Your Orders',
    //     orders: orders
    //   });
    // })
    // .catch(err => {
    //   const error = new Error(err);
    //   error.httpStatusCode = 500;
    //   return next(error);
    // });
  };


  exports.postOrder = async (req, res, next) => {
    //fetch the products in the cart for a particular user
    // req.user.populate("cart.items.productId")
    // .execPopulate((err, user) => {
    //   if(err) {
    //     const error = new Error(err);
    //     error.httpStatusCode = 500;
    //     return next(error);
    //   };
    //   console.log(`The product is ${user.cart.items}`); 
    // });
    // res.redirect('/');
    try {
      const user = await req.user
        .populate("cart.items.productId")
        .execPopulate();
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          product: { ...item.productId._doc },
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      await order.save();
      await req.user.clearCart();
      res.redirect("/orders");
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    
    
    // console.log(products);
    // res.redirect('/');
      
    
    // req.user
      // .populate("cart.items.productId")
      // .execPopulate()
      // .then((user) => {
      //   const products = user.cart.items.map((item) => {
      //     return {
      //       quantity: item.quantity,
      //       product: { ...item.productId._doc },
      //     };
      //   });
      //   const order = new Order({
      //     user: {
      //       email: req.user.email,
      //       userId: req.user
      //     },
      //     products: products,
      //   });
      //   return order.save();
      // })
      // .then((result) => {
      //   return req.user.clearCart();
      // })
      // .then(() => {
      //   res.redirect("/orders");
      // })
      // .catch(err => {
      //   const error = new Error(err);
      //   error.httpStatusCode = 500;
      //   return next(error);
      // });
  };

  exports.getInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new Error(`No order found`));
      }

      if (order.user.userId.toString !== req.user._id.toString) {
        return next(new Error(`Unauthorized!`));
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline: filename=${invoiceName}`);

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.moveDown();
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice = totalPrice + prod.product.price * prod.quantity;
        pdfDoc.fontSize(14).text(`Title: ${prod.product.title}`);
        pdfDoc.text(`Price: ${prod.product.price}`);
        pdfDoc.text(`Quantity: ${prod.quantity}`);
      });
      pdfDoc.moveDown();
      pdfDoc.fontSize(20).text(`Total Price: Ksh.${totalPrice}`);

      pdfDoc.end();
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    // Order.findById(orderId)
    //   .then((order) => {
    //     if (!order) {
    //       return next(new Error(`No order found`));
    //     }

    //     if (order.user.userId.toString !== req.user._id.toString) {
    //       return next(new Error(`Unauthorized!`));
    //     }
    //     const invoiceName = `invoice-${orderId}.pdf`;
    //     const invoicePath = path.join("data", "invoices", invoiceName);

    //     const pdfDoc = new PDFDocument();
    //     res.setHeader("Content-Type", "application/pdf");
    //     res.setHeader("Content-Disposition", `inline: filename=${invoiceName}`);

    //     pdfDoc.pipe(fs.createWriteStream(invoicePath));
    //     pdfDoc.pipe(res);

    //     pdfDoc.fontSize(26).text('Invoice', {
    //       underline: true
    //     });
    //     pdfDoc.moveDown();
    //     let totalPrice = 0;
    //     order.products.forEach(prod => {
    //       totalPrice = totalPrice + prod.product.price * prod.quantity;
    //       pdfDoc.fontSize(14).text(`Title: ${prod.product.title}`);
    //       pdfDoc.text(`Price: ${prod.product.price}`);
    //       pdfDoc.text(`Quantity: ${prod.quantity}`);
    //     })
    //     pdfDoc.moveDown();
    //     pdfDoc.fontSize(20).text(`Total Price: Ksh.${totalPrice}`);

    //     pdfDoc.end();
    //     // fs.readFile(invoicePath, (err, data) => {
    //     //   if (err) {
    //     //     return next(err);
    //     //   }
    //     //   res.setHeader("Content-Type", "application/pdf");
    //     //   res.setHeader("Content-Disposition", `inline: filename=${invoiceName}`);
    //     //   res.send(data);
    //     // });
    //   })
    //   .catch((err) => {
    //     next(err);
    //   });
  };


exports.getCheckOut = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout Page'
  })
};

exports.postCheckOut = async (req, res, next) => {
  let products,
    total = 0;
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    // console.log(user);
    products = user.cart.items;
    console.log(products);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//Contact Controller
exports.getContact = (req, res, next) => {
  res.render("shop/contact", {
    pageTitle: "Contact Us",
    path: "/contact"
  });
};


