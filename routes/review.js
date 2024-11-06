const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(err => err.message).join(', ');
        throw new ExpressError(400, message);
    } else {
        next();
    }
};

// Post Review Route
router.post("/",validateReview, wrapAsync(async(req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);

    // console.log("new review saved");
    // res.send("new review saved");
}));


//Delete Review Route
// Delete Review Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, review_Id } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: review_Id } });
    await Review.findByIdAndDelete(review_Id);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));


module.exports = router;