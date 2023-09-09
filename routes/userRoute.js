const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const protect = require("../middleWare/authMiddleware");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

router.post("/register", async (req, res) => {
  const { fullname, password, email, userImage } = req.body;
  console.log(req.body);

  // if (!fullname || !email || !password) {
  //   return res.status(400).json({ error: "please fill all fields" });
  // }

  // if (password.length < 8) {
  //   return res
  //     .status(400)
  //     .json({ error: "password must be up to 8 characters" });
  // }

  // // Check if user email already exists
  // const userExists = await User.findOne({ email });

  // if (userExists) {
  //   return res.status(400).json({ error: "email has already been registered" });
  // }

  // // Create new user
  // const user = await User.create({
  //   email,
  //   fullname,
  //   password,
  //   userImage,
  // });

  // //   Generate Token
  // const token = generateToken(user._id);

  // // Send HTTP-only cookie
  // res.cookie("token", token, {
  //   path: "/",
  //   httpOnly: true,
  //   expires: new Date(Date.now() + 1000 * 86400), // 1 day
  //   sameSite: "none",
  //   secure: true,
  // });

  // if (user) {
  //   const { _id, fullname, email, password, isAdmin, userImage } = user;
  //   res.status(200).json({
  //     _id,
  //     fullname,
  //     email,
  //     password,
  //     isAdmin,
  //     userImage,
  //     token,
  //   });
  // } else {
  //   res.status(400);
  //   throw new Error("Invalid user data");
  // }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    return res.status(400).json({ error: "Please add email & password" });
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    return res.status(400).json({ error: "user not found! please register" });
  }

  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, fullname, email, password, isAdmin, userImage } = user;
    res.status(200).json({
      _id,
      fullname,
      email,
      password,
      userImage,
      isAdmin,
      token,
    });
  } else {
    return res.status(400).json({ error: "invalid email or password" });
  }
});

router.get("/logout", async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
});

router.get("/loggedin", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

module.exports = router;
