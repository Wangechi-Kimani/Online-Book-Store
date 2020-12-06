const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const User =  require('../models/user');

//Transpoter tells nodemailer how the email messages will be delivered
const transpoter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "",
    pass: ""
  }
});

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie')
    // // console.log(isLoggedIn);
    let message  = req.flash('error');
    if(message.length > 0) {
      message = message[0]
    } else {
      message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        inputValues: {
          email: '',
          password: ''
        },
        validationErrors: []
    });
}

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      inputValues: {
        email: email,
        password: password,
      },
      validationErrors: errors.array()
    });
  }

  try {
    //find out if the email provided by the user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      //if no user with provided email exists give an error message and redirect to login page
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }
    //Check for matching password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    //if password matches login and redirect to index/home page
    if (passwordMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    }
    //if password don't match redirect to login
    res.status(404).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: "Invalid email or password",
      inputValues: {
        email: email,
        password: password,
      },
      validationErrors: [],
    });
  } catch(err) {
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }
  
  // User.findOne({ email: email })
  //   .then((user) => {
  //     if (!user) {
  //       //if no user with provided email exists give an error message and redirect to login page
  //       req.flash("error", "Invalid email or password");
  //       return res.redirect("/login");
  //     }
  //     //Check for matching password using bcrypt
  //     bcrypt
  //       .compare(password, user.password)
  //       .then((passwordMatch) => {
  //         //if password matches
  //         if (passwordMatch) {
  //           // console.log(`password match`);
  //           req.session.isLoggedIn = true;
  //           req.session.user = user;
  //           return req.session.save((err) => {
  //             console.log(err);
  //             res.redirect("/");
  //           });
  //         }
  //         //if password don't match redirect to login
  //         return res.status(404).render('auth/login', {
  //           path: '/login',
  //           pageTitle: 'Login',
  //           errorMessage: 'Invalid email or password',
  //           inputValues: {
  //             email: email,
  //             password: password
  //           },
  //           validationErrors: []
  //         });
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   })
  //   .catch((err) => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    // console.log(err);
    res.redirect('/');
  })
}
exports.getSignUp = (req, res, next) => {
  let message  = req.flash('error');
    if(message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    path: '/signup',
    errorMessage: message,
    inputValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  })
}

exports.postSignUp = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  //if there are errors
  if (!errors.isEmpty()) {
    // return res.status(422).json({ errors: errors.array() });
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign Up",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      inputValues: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    //find out if an email being registered already exists
    const hashedPassword = await bcrypt.hash(password, 12);
    //create an instance of a new user
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });
    //save the user in the DB
    await user.save();
    //redirect to login page
    res.redirect("/login");
    return transpoter.sendMail({
      to: email,
      from: "shop@nodecomplete.com",
      subject: "Signup Completed",
      html: "<h2> You successfully signed up</h2>",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }


  // bcrypt
  //   .hash(password, 12)
  //   .then((hashedPassword) => {
  //     const user = new User({
  //       email: email,
  //       password: hashedPassword,
  //       cart: { items: [] }
  //     });
  //     return user.save();
  //   })
  //   .then((result) => {
  //     res.redirect("/login");
  //     return transpoter.sendMail({
  //       to: email,
  //       from: "shop@nodecomplete.com",
  //       subject: "Signup Completed",
  //       html: "<h2> You successfully signed up</h2>",
  //     });
  //   })
  //   .catch((err) => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};


exports.getReset = (req, res, next) => {
  let message  = req.flash('error');
    if(message.length > 0) {
      message = message[0]
    } else {
      message = null;
    }
  res.render('auth/reset',  {
    pageTitle: 'Reset Password',
    path: '/reset',
    errorMessage: message
  })
}

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  
  if (email === "") {
    req.flash('error', 'Email field is required');
    return res.redirect('/reset');
  }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    //Check if there's an existing email address
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Provided Email does not exist");
          return res.redirect("/reset");
        }
        user.resetToken = token,
        user.resetTokenExpiration = Date.now() + 3600000; //one hour
        return user.save();
      })
      .then(result => {
        res.redirect('/')
          transpoter.sendMail({
          to: email,
          from: "shop@nodecomplete.com",
          subject: "Request For Password Reset",
          html: `
      <p>You requested for a password Reset</p>
      <p>Click this <a href = "http://localhost:3000/reset/${token}">link</a> to reset your password</p>
      `,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/new-password",
        errorMessage: message,
        passwordToken: token,
        userId: user._id.toString()
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({ resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedNewPassword => {
      resetUser.password = hashedNewPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
      transpoter.sendMail({
        to: resetUser.email,
        from: 'onlineshop@info.co.ke',
        subject: 'Password Reset',
        html: `Your password was successfully changed`
      })
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

// exports.postLogin = (req, res, next) => {
//   User.findById("5ea2bae6a63a0a27ec3b2cc1")
//     .then((user) => {
//       // console.log(user);
//       if (user !== null) {
//         req.session.user = {
//           name: user.name,
//           email: user.email,
//         };
//         // console.log(req.session.user.name)
//       }
//     })
//     .then(() => {
//       res.redirect("/");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

//https://opensourceforu.com/2020/03/session-handling-in-node-js-a-tutorial/
//https://gabrieleromanato.name/creating-and-managing-sessions-in-expressjs
