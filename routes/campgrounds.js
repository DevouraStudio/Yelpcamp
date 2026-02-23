const express = require("express")
const router = express.Router()
const catchAsync = require("../utilities/catchAsync")
const Campground = require("../models/campground")
const { campgroundSchema } = require("../schemas.js")
const ExpressError = require("../utilities/ExpressError")
const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)
	if (error) {
		const msg = error.details.map(el => el.message).join(",")
		throw new ExpressError(msg, 400)
	}
	next()
}
router.get("/", catchAsync(async (req, res) => {
	const campgrounds = await Campground.find({})
	res.render("campgrounds/index", { campgrounds })
}))
router.get("/new", (req, res) => {
	res.render("campgrounds/new")
})
router.get("/:id", catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id).populate("reviews")
	res.render("campgrounds/show", { campground })
}))
router.post("/", validateCampground, catchAsync(async (req, res) => {
	const campground = new Campground(req.body.campground)
	await campground.save()
	res.redirect(`/campgrounds/${campground._id}`)
}))
router.get("/:id/edit", catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render("campgrounds/edit", { campground })
}))
router.put("/:id", validateCampground, catchAsync(async (req, res) => {
	const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { useFindAndModify: false })
	await campground.save()
	res.redirect(`/campgrounds/${campground._id}`)
}))
router.delete("/:id", catchAsync(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id, { useFindAndModify: false })
	res.redirect("/campgrounds")
}))
module.exports = router