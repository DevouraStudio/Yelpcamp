const express = require("express")
const router = express.Router({ mergeParams: true })
const catchAsync = require("../utilities/catchAsync")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares")
const reviews = require("../controllers/reviews")

router.post("/", validateReview, isLoggedIn, catchAsync(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router