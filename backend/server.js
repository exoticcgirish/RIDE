const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./src/app");

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
});
