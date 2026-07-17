const express = require("express")
const router = express.Router({ mergeParams: true })
const catchAsync = require("../utilities/catchAsync")
const Campground = require("../models/campground")
const Review = require("../models/review")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares")
router.post("/", validateReview, isLoggedIn, catchAsync(async (req, res) => {
	const { id } = req.params
	const campground = await Campground.findById(id)
	const review = await new Review(req.body.review)
	review.author = req.user._id
	campground.reviews.push(review)
	await campground.save()
	await review.save()
	req.flash("success", "Successfully made a new review!")
	res.redirect(`/campgrounds/${id}`)
}))
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
	const { id, reviewId } = req.params
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { useFindAndModify: false })
	await Review.findByIdAndDelete(reviewId)
	req.flash("success", "Review deleted successfully!")
	res.redirect(`/campgrounds/${id}`)
}))
module.exports = router