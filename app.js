//Global packages. Packages shipped with Nodejs
const path = require('path');


//Installed packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session) //this yields a constructor function
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

//Imported pages/files
const errorController = require('./controllers/404');
const User =  require('./models/user');

//Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();

const MONGODB_URI = ""

//new store instance on creating a sesssions collection and storing the session data in the database
const store = new MongoDBStore({ 
  uri: MONGODB_URI,
  collection: 'sessions'
})

//initialize csrf protection
const crsfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now().toLocaleString(undefined, {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }) +
        "-" +
        file.originalname
    );
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  };
  
};

//Specify the templating engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended:false})); //text data
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use('/admin', express.static(path.join(__dirname, 'public')))
// app.use('/products', express.static(path.join(__dirname, 'public')))


// Initialize Session middleware
app.use(session({
  secret: '', //this key-value pair is used in assigning hash that secretly stores the id in the Cookie
  resave:  false, // this means the session will not be saved on every request that is done/every response sent 
  saveUninitialized: false, //this means no session is saved for a request that doesnt need to be saved becoz nothing was changed
  store: store
}));

//Use csrf middleware
app.use(crsfProtection);
app.use(flash());

app.use((req, res, next) => {
  //locals field is found in the response(res) object
  //locals field allows us to variables that are passed into the views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

// Register a middleware to use the user retirieved from the DB anywhere in this application
app.use((req, res, next) => {
  if(!req.session.user) { //if no user logged in, stored in the session
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user) {
        return next();
      }
      req.user = user;
      // req.user = user.dataValues;
      // console.log(req.user);    
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});



//Utilize the routes
app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);


//middleware to handle technical errors
app.get('/500', errorController.get500);


// Middleware to handle 404 Pages
app.use(errorController.getErrorPage);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500'
  });
  console.log(error);
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log(`Connection Successful`);
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });





