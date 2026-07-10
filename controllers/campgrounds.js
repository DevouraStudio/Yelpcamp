const Campground = require("../models/campground")

const { deleteFromArvan } = require("../Arvancloud")

const axios = require("axios")

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({}).sort({ _id: -1 })
	const clusterSource = {
		type: "FeatureCollection",
		features: campgrounds.map(campground => ({
			type: "Feature",
			geometry: campground.geometry,
			properties: {
				popup: campground.properties.popup
			}
		}))
	}
	res.render("campgrounds/index", { campgrounds, clusterSource})
}

module.exports.renderNewForm = (req, res) => {
	res.render("campgrounds/new")
}

module.exports.showCampground = async (req, res) => {
	const campground = await Campground.findById(req.params.id).populate({
		path: "reviews",
		populate: {
			path: "author"
		}
	}).populate("author")
	if (!campground) {
		req.flash("error", "Cannot find that campground!")
		return res.redirect("/campgrounds")
	}
	res.render("campgrounds/show", { campground })
}

module.exports.createCampground = async (req, res) => {
	const campground = new Campground(req.body.campground)
	const coordinates = await axios.get(`https://geocode.maps.co/search?q=${req.body.campground.location}&api_key=${process.env.GEOCODING_API_KEY}&format=geojson`)
	campground.author = req.user._id
	campground.images = req.files.map(f => ({ url: f.location, filename: f.key }))
	campground.geometry = coordinates.data.features[0].geometry
	await campground.save()
	req.flash("success", "Successfully made a new campground!")
	res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderEditForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	if (!campground) {
		req.flash("error", "Cannot find that campground!")
		return res.redirect("/campgrounds")
	}
	res.render("campgrounds/edit", { campground })
}

module.exports.updateCampground = async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	const images = req.files.map(f => ({ url: f.location, filename: f.key }))
	campground.images.push(...images)
	await Campground.updateOne(req.body.campground, { useFindAndModify: false })
	if (req.body.deleteImage) {
		for (let filename of req.body.deleteImage) {
			await deleteFromArvan(filename)
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImage } } } })
	}
	await campground.save()
	req.flash("success", "Campground updated successfully!")
	res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id, { useFindAndModify: false })
	req.flash("success", "Campground deleted successfully!")
	res.redirect("/campgrounds")
}