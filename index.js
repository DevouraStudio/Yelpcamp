const express = require("express")
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const Campground = require("./models/campground")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const catchAsync = require("./utilities/catchAsync")
const ExpressError = require("./utilities/ExpressError")
const { campgroundSchema } = require("./schemas.js")
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.engine("ejs", ejsMate)
mongoose.connect("mongodb://localhost:27017/Yelpcamp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
})
	.then(() => {
		console.log("Database is running!")
	})
	.catch((err) => {
		console.log(err, "Database is not running!!")
	})
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)
	if (error) {
		const msg = error.details.map(el => el.message).join(",")
		throw new ExpressError(msg, 400)
	}
}
app.get("/campgrounds", catchAsync(async (req, res) => {
	const campgrounds = await Campground.find({})
	res.render("campgrounds/index", { campgrounds })
}))
app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new")
})
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render("campgrounds/show", { campground })
}))
app.post("/campgrounds", validateCampground, catchAsync(async (req, res) => {
	const campground = new Campground(req.body.campground)
	await campground.save()
	res.redirect(`/campgrounds/${campground._id}`)
}))
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render("campgrounds/edit", { campground })
}))
app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
	const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { useFindAndModify: false })
	await campground.save()
	res.redirect(`/campgrounds/${campground._id}`)
}))
app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id, { useFindAndModify: false })
	res.redirect("/campgrounds")
}))
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found!", 404))
})
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err
	if (!err.message) err.message = "Something went wrong, Please try again later."
	res.status(statusCode).render("error", { err })
})
app.listen(3000, () => {
	console.log("Server running on port 3000!")
})