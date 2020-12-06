const express = require('express');

//Controllers
const shopController = require('../controllers/shop');
const adminController = require('../controllers/admin');
const isAuth =  require('../middleware/is_auth');

//regsiter a router
const router = express.Router();



//Index Route
router.get('/', shopController.getIndex);


// //Products Route
router.get('/products', shopController.getProducts);
// router.get('/product-list', shopController.getProductList);
// router.post('/products', adminController.postAddProduct);
router.get('/products/:productId', shopController.getProduct);

// //Cart Routes
router.get('/cart', isAuth,shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
// router.post('/check-out')

router.get('/orders', isAuth, shopController.getOrders);
router.post('/create-order',isAuth, shopController.postOrder);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', shopController.getCheckOut);
module.exports = router;