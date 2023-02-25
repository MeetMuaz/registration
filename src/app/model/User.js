const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    username: {
        type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);