const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Schema for both College and Primary Applications
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please add fullname"],
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [8, "Password must be up to 8 characters"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    userImage: {
      type: String,
      required: [true, "Please add a photo"],
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fuser_219983&psig=AOvVaw1KZikR2I82IVZY3dD9OanN&ust=1694169245603000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCMDzsI6nmIEDFQAAAAAdAAAAABAE",
    },
  },

  {
    timestamps: true,
  }
);

//   Encrypt password before saving to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
