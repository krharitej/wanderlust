const mongoose = require("mongoose"); //requireing mongoose
const Schema = mongoose.Schema; //creating schema 

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:"//unsplash.com/photos/brown-wooden-boat-moving-towards-the-mountain-O453M2Liufs",
    set: (v) => v === "" ? "https://unsplash.com/photos/brown-wooden-boat-moving-towards-the-mountain-O453M2Liufs" : v,
  },
  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema); //creating model
module.exports = Listing; //exporting models

