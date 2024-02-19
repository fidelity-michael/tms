const mongoose = require("mongoose");

// Schema
const Favourite_Schema = new mongoose.Schema({
  student: {
    type: String,
    required: true,
  },
  area_id: {
    type: String,
    required: true,
  },
  area_name: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("Favourite", Favourite_Schema);
