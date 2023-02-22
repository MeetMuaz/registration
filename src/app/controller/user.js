const User = require("../model/User");
const bcrypt = require("bcrypt");
const Joi = require('Joi');
const crypto = require('crypto');
const nodemailer = require('nodemailer')

//USER REGISTER
exports.userRegister = async (req, res) => {
  try {

    // Joi validator
    const userSchema = Joi.object({
      firstname: Joi.string().min(3).max(30).required(),
      lastname: Joi.string().min(3).max(30).required(),
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(30).required(),
      confirmpassword: Joi.string().valid(Joi.ref('password')).required(),
    })
    // Joi.ref("password")

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

    // Joi validator
    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })

    // check error
    const { error, value } = userSchema.validate(req.body, {
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
    res.status(200).json(user._id);
    
  } catch (err) {
    res.status(500).json(err);
  }
}

//FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {

  // company email
  const companyEmail = process.env.COMPANY_EMAIL;

  // company password 
  const companyPassword = process.env.COMPANY_PASSWORD;

  try {

    // Joi validator
    const userSchema = Joi.object({
      email: Joi.string().email().required(),
    })

    // check error
    const { error, value } = userSchema.validate(req.body, {
      abortEarly: false,
    })

    // return error from fileds
    if (error) return res.status(400).json(error.details[0].message);

    //find user
    const user = await User.findOne({ email: req.body.email });

    !user && res.status(400).json("Invalid email address");

    //generate a unique token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();


    const resetUrl = `https://localhost:4400/reset-password?token=${token}`;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: companyEmail,
        pass: companyPassword
      }
    });
  
    let mailOptions = {
      from: companyEmail,
      to: user.email,
      subject: 'Test Email',
      text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
        Please click on the following link, or paste it into your browser to reset your password:\n\n
        http://${resetUrl}/reset-password/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(500).json('An email has been sent to the provided email with further instructions.');

  } catch (err) {
    res.status(500).json(err);
  }
}

// RESET PASSWORD
exports.resetPassword = async (req, res) => {

  try {

    const userSchema = Joi.object({
      password: Joi.string().min(6).max(30).required(),
      confirmpassword: Joi.string().valid(Joi.ref('password')).required(),
    })


    // check error
    const { error } = userSchema.validate(req.body, {
      abortEarly: false,
    })

    // return error from fileds
    if (error) return res.status(400).json(error.details[0].message);

    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json('Invalid or expired token. Please try again.');
    }

    // Update the user's password and clear the reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json('Your password has been reset.');
    
  } catch (err) {
    res.status(500).json(err);
  }
}