const express = require("express");
const router = express.Router();
const BlogPost = require("../models/postModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;
const protect = require("../middleWare/authMiddleware");
const { upload } = require("../utils/fileUpload");


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, content, iimage, tag } = req.body;

    const user = await User.findById(req.user.id);

    if (!title || !subtitle || !content || !tag) {
      return res
        .status(400)
        .json({ error: "Title, Description & content are required" });
    }

    let fileData = {};

    if (req.file) {
      // Upload image to Cloudinary and apply transformations
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "edu",
        transformation: [
          { width: 1080, height: 1080, quality: 80, crop: "fill" },
        ],
      });
      // Create a new instance of the BlogPost model
      const post = await BlogPost.create({
        author: req.user.id,
        name: user.fullname,
        userimage: user.userImage,
        title,
        subtitle,
        tag,
        image: result.secure_url,
        content: content.replace(/\n/g, "<br/>"),
        iimage,
      });

      // Save the new post to the database
      return res.status(201).json(post);
    } else {
      const post = await BlogPost.create({
        author: req.user.id,
        name: user.fullname,
        userimage: user.userImage,
        title,
        subtitle,
        tag,
        content: content.replace(/\n/g, "<br/>"),
        iimage,
      });

      res.status(201).json(post);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Retrieve all blog posts from the database
    const posts = await BlogPost.findById(req.params.id);

    return res.status(200).send(posts);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
});

router.post("/addcomment/:id", protect, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Please enter a comment" });
  }

  try {
    const post = await BlogPost.findById(req.params.id);
    // const user = await User.findById(req.user.id);

    if (!post) {
      res.status(404);
      return res.status(400).json({ error: "Post not found" });
    }

    const comment = {
      text,
      user: req.user.id,
      name: req.user.fullname,
    };

    post.comments.push(comment);

    await post.save();

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, content, iimage, tag } = req.body;

    // Check if the user is authorized to update the post (you may need additional authorization logic)
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // You may want to add further authorization logic here to ensure the user can update the post

    const user = await User.findById(req.user.id);

    if (!title || !subtitle || !content || !tag) {
      return res.status(400).json({ error: "Title, Description & content are required" });
    }

    let fileData = {};

    if (req.file) {
      // Upload image to Cloudinary and apply transformations
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "edu",
        transformation: [
          { width: 1080, height: 1080, quality: 80, crop: "fill" },
        ],
      });
      
      // Update the existing post with the new data
      post.author = req.user.id;
      post.name = user.fullname;
      post.userimage = user.userImage;
      post.title = title;
      post.subtitle = subtitle;
      post.tag = tag;
      post.image = result.secure_url;
      post.content = content.replace(/\n/g, "<br/>");
      post.iimage = iimage;
      
      await post.save();

      // Return the updated post
      return res.status(200).json(post);
    } else {
      // Update the existing post with the new data (excluding the image)
      post.author = req.user.id;
      post.name = user.fullname;
      post.userimage = user.userImage;
      post.title = title;
      post.subtitle = subtitle;
      post.tag = tag;
      post.content = content.replace(/\n/g, "<br/>");
      post.iimage = iimage;

      await post.save();

      // Return the updated post
      return res.status(200).json(post);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
    console.log(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
