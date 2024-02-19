const mongoose = require("mongoose");

// Schema
const Area_Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "No Description",
  },
  image: {
    type: String,
    default: "default.jpg",
  },
});

module.exports = mongoose.model("Area", Area_Schema);
