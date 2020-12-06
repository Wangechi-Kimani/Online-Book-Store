const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema =  new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
      type: String,
      required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    //Cart Array Items
  const cartItemsArray = this.cart.items;

  //Copy the current cart items array using the spread 
  const updatedCartItems = [...cartItemsArray];

  //Initialize the newQuantity variable
  let newQuantity = 1;
  
  //Function to find out if there is an existing product in the cart
  const doesProductExistInCart = (prodId) => {
    //compare the current product in the cart with the product being passed as an argument and return the value
    return prodId.productId.toString() === product._id.toString();
  }
   
  //Use the findIndex method to find the index of the product in the cart
   const resultIndex = cartItemsArray.findIndex(doesProductExistInCart)
  //  console.log(resultIndex);


  if(resultIndex !== -1) { 
    //if product exists in the cart
    // console.log(`Product in cart`);
    
    //1. increase the quantity by 1
    newQuantity = cartItemsArray[resultIndex].quantity + 1;
    
    //2. update the quantity value of the product in the cart
    updatedCartItems[resultIndex].quantity = newQuantity;
  } else {
    //if no product exists in the cart
    // console.log(`No product in cart`);

    //push the items(productId and quantity) in the cart array
    updatedCartItems.push({
      productId: product._id, //id of the product being passed as an argument when this function is called
      quantity: newQuantity //value of the newQuantity initialized in this function
    });
  }
  //create a variable to store the updated cart with the updated items
  const updatedCart = {
    items: updatedCartItems
  };
  
  //assign the cart with the updated cart values
  this.cart = updatedCart;

  //save the cart
  return this.save();

}

userSchema.methods.removeFromCart = function(prodId) {
    //filter all the items expect the one I want to remove
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== prodId.toString()
    });
  
    this.cart.items = updatedCartItems;
  
    return this.save();
  }

  userSchema.methods.clearCart = function() {
    this.cart = { items: [] }
    return this.save();
  }

module.exports = mongoose.model('User', userSchema);









