const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isTwoFactorSet: {
      type: Boolean,
      required: false,
      default: false,
    },
    secret: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", User);
