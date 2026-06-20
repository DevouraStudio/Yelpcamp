const Campground = require("./models/campground")

const { campgroundSchema } = require("./schemas.js")

const ExpressError = require("./utilities/ExpressError")

const { reviewSchema } = require("./schemas.js")

const Review = require("./models/review")

const multer = require("multer")

const { upload } = require("./Arvancloud")

const uploadMulter = upload.array("campground[images]", 5)

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)
	if (error) {
		const msg = error.details.map(el => el.message).join(",")
		throw new ExpressError(msg, 400)
	}
	next()
}

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body)
	if (error) {
		const msg = error.details.map(el => el.message).join(",")
		throw new ExpressError(msg, 400)
	}
	next()
}

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl
		req.flash("error", "You must be signed in first!")
		return res.redirect("/login")
	}
	next()
}

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params
	const campground = await Campground.findById(id)
	if (!campground.author.equals(req.user._id)) {
		req.flash("error", "You do not have any permission to do that!")
		res.redirect(`/campgrounds/${id}`)
	}
	next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params
	const review = await Review.findById(reviewId)
	if (!review.author.equals(req.user._id)) {
		req.flash("error", "You do not have any permission to do that!")
		res.redirect(`/campgrounds/${id}`)
	}
	next()
}

module.exports.newUploadImage = (req, res, next) => {
	uploadMulter(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_COUNT") {
				req.flash("error", "Uploading more than 5 images each time is not permitted! Please try again!")
				return res.redirect(`/campgrounds/new`)
			}
			if (err.code === "LIMIT_FILE_SIZE") {
				req.flash("error", "Uploading an image over 15 MB is not permitted! Please try again!")
				return res.redirect(`/campgrounds/new`)
			}
			next()
		}

	})
}

module.exports.editUploadImage = (req, res, next) => {
	const { id } = req.params
	uploadMulter(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_COUNT") {
				req.flash("error", "Uploading more than 5 images each time is not permitted! Please try again!")
				return res.redirect(`/campgrounds/${id}`)
			}
			if (err.code = "LIMIT_FILE_SIZE") {
				req.flash("error", "Uploading an image over 15 MB is not permitted! Please try again!")
				return res.redirect(`/campgrounds/${id}`)
			}
			next()
		}

	})
}