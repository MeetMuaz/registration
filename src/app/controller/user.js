const User = require("../model/User");
const bcrypt = require("bcrypt");
const joi = require('joi');

//USER REGISTER
exports.userRegister = async (req, res) => {
  try {

    // joi validator
    const userSchema = joi.object({
      firstname: joi.string().min(3).max(30).required(),
      lastname: joi.string().min(3).max(30).required(),
      username: joi.string().min(3).max(30).required(),
      email: joi.string().email().required(),
      password: joi.string().min(6).max(30).alphanum().required(),
      confirmPassword: joi.ref("password")
    })

    // check error
    const { error } = userSchema.validate(req.body, {
      abortEarly: false,
    })

    // return error from fileds
    if (error) return res.status(400).json(error.details[0].message);

    //check if email exists
    const emailExists = await User.findOne({ email: req.body.email });
    emailExists && res.status(400).json("email already exists!");

    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user._id);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


//USER LOGIN
exports.userLogin = async (req, res) => {
  try {

    // joi validator
    const userSchema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    })

    // check error
    const { error } = userSchema.validate(req.body, {
      abortEarly: false,
    })

    // return error from fileds
    if (error) return res.status(400).json(error.details[0].message);

    //find user
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(400).json("Wrong email or password");

    //validate password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("Wrong email or password");

    //send response
    res.status(200).json({ _id: user._id, email: user.email });
    
  } catch (err) {
    res.status(500).json(err);
  }
}