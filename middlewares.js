const Campground = require("./models/campground")
const { campgroundSchema } = require("./schemas.js")
const ExpressError = require("./utilities/ExpressError")
module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)
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