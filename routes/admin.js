const express = require('express');
const { body } = require('express-validator');

//Controllers
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is_auth');

const router = express.Router();

//Get All Products
router.get('/products', adminController.getProducts);

// //Add Product
router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', [
    body('title').isString().isLength({min: 3}).withMessage('Title must be a String with a minimum of three characters').trim(), 
    body('price').isFloat(), 
    body('description').isLength({min: 5, max: 400}).withMessage('Description must have a minimum of three characters').trim()
], isAuth, adminController.postAddProduct);

// //Edit Product
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body('title').isString().isLength({min: 3}).withMessage('Title must be a String with a minimum of three characters').trim(), 
    body('price').isFloat(), 
    body('description').isLength({min: 5, max: 400}).withMessage('Description must have a minimum of three characters').trim()
], isAuth, adminController.postEditProduct);

// //Delete Product
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;