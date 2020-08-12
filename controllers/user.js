// init code
const router = require('express').Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('./../models/user');


// middleware setup
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// routes goes here

// default route
router.all(
  '/',
  function (req, res) {
    return res.json({
      status: true,
      message: 'User controller working...'
    });
  }
);

// create new user route
router.post(
  '/createNew',
  [
    // check not empty fields
    check('username').not().isEmpty().trim().escape(),
    check('password').not().isEmpty().trim().escape(),
    check('email').isEmail().normalizeEmail()
  ],
  function (req, res) {
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: 'Form validation error.',
        errors: errors.array()
      });
    }

    // hash password code
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    // create new use model
    var temp = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    // insert data into database
    temp.save(function (error, result) {
      // check error
      if (error) {
        return res.json({
          status: false,
          message: 'DB Insert Fail...',
          error: error
        });
      }

      // Everything OK
      return res.json({
        status: true,
        message: 'DB Insert Success...',
        result: result
      });
    });
  }
);

// find user document route
router.get(
  '/find',
  function (req, res) {
    // find user document
    User.find(function (error, result) {
      // check error
      if (error) {
        return res.json({
          status: false,
          message: 'DB Find Fail...',
          error: error
        });
      }

      // if everything OK
      return res.json({
        status: true,
        message: 'DB Find Success...',
        result: result
      });
    });
  }
);

// update user document
router.put(
  '/update/:email',
  function (req, res) {
    // check email is empty or not
    if (req.params.email) {
      // update user document
      User.update(
        { email: req.params.email },
        { username: 'Shubham Arora' },
        function (error, result) {
          // check error
          if (error) {
            return res.json({
              status: false,
              message: 'DB Update Fail...',
              error: error
            });
          }

          // if everything OK
          return res.json({
            status: true,
            message: 'DB Update Success...',
            result: result
          });
        }
      );
    } else {
      return res.json({
        status : false,
        message : 'Email not provided...'
      });
    }
  }
);

// remove user document
router.delete(
  '/delete/:email',
  function(req, res){
    // check email not empty
    if ( req.params.email ){
      User.remove(
        { email : req.params.email },
        function(error, result){
          // check error
          if (error){
            return res.json({
              status : false,
              message : 'DB Delete Fail...',
              error : error
            });
          }

          // everything OK
          return res.json({
            status : true,
            message : 'DB Delete Success...',
            result : result
          });
        }
      );
    } else {
      // if email not provided
      return res.json({
        status : false,
        message : 'Email not provided.'
      });
    } 
  }
);

// login router for user
router.post(
  '/login',
  [
    // check not empty fields
    check('password').not().isEmpty().trim().escape(),
    check('email').isEmail().normalizeEmail()
  ],
  function(req, res){
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: 'Form validation error.',
        errors: errors.array()
      });
    }

    // check email exist or not
    User.findOne(
      { email : req.body.email },
      function(error, result){
        // check error
        if (error){
          return res.json({
            status : false,
            message : 'DB Read Fail...',
            error : error
          });
        }

        // result is empty or not
        if ( result ){
          // when result variable contains document
          // match password
          const isMatch = bcrypt.compareSync(req.body.password, result.password);

          // check password is match
          if (isMatch){
            // password matched
            return res.json({
              status : true,
              message : 'User exists. Login Success...',
              result : result
            });
          } else {
            // password not matched
            return res.json({
              status : false,
              message : 'Password not matched. Login Fail...',
            });
          }
        } else {
          // user document don't exists
          return res.json({
            status : false,
            message : 'User don\'t exists.'
          });
        }

      }
    );
  }
);

// module exports
module.exports = router;