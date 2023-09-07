const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const postRoute = require("./routes/postRoute");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cors = require("cors");
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

cors;
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dazzling-cupcake-6525a1.netlify.app", "*", "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fen%2Ffree-png-zybui&psig=AOvVaw3cbMtl2gMz1vsG4x90IcLm&ust=1694190641943000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCLjLhI72mIEDFQAAAAAdAAAAABAE"
    ],
    credentials: true,
  })
);

// Routes Middleware
app.use("/post", postRoute);
app.use("/user", userRoute);

//Error Middleware
app.use(errorHandler);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
