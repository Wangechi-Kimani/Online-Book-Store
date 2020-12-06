const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    imageUrl: {
        type:String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);


// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Model = Sequelize.Model;

// class Product extends Model {}

// Product.init({
//     id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     title: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false
//     },
//     author: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     genre: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.TEXT,
//         allowNull: false
//     }
// },  {
//     sequelize,
//     modelName: 'product'
// })

// module.exports = Product;