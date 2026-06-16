const express = require("express")

const router = express.Router()

const catchAsync = require("../utilities/catchAsync")

const { validateCampground, isLoggedIn, isAuthor } = require("../middlewares")

const campgrounds = require("../controllers/campgrounds")

const upload = require("../Arvancloud")

router.route("/")
	.get(catchAsync(campgrounds.index))
	.post(isLoggedIn, upload.array("campground[images]", 10), validateCampground, catchAsync(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn, isAuthor, upload.array("campground[images]", 10), validateCampground, catchAsync(campgrounds.updateCampground))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router