const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utilities/catchAsync")
const passport = require("passport")
router.get("/register", (req, res) => {
	res.render("users/register")
})
router.post("/register", catchAsync(async (req, res) => {
	try {
		const { username, email, password } = req.body
		const user = await new User({ username, email })
		const registeredUser = await User.register(user, password)
		req.login(registeredUser, error => {
			if (error) {
				return next(error)
			}
			req.flash("success", "Welcome to Yelpcamp!")
			res.redirect("/campgrounds")
		})
	} catch (e) {
		req.flash("error", e.message)
		res.redirect("/register")
	}
}))
router.get("/login", (req, res) => {
	res.render("users/login")
})
router.post("/login", (req, res, next) => {
	const redirectUrl = req.session.returnTo || "/campgrounds"
	passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }, (err, user) => {
		if (err) return next(err)
		if (!user) return res.redirect("/login")
		req.logIn(user, (err) => {
			if (err) return next(err)
			req.flash("success", "Welcome back to Yelpcamp!")
			delete req.session.returnTo
			res.redirect(redirectUrl)
		})
	})(req, res, next)
})
router.get("/logout", (req, res) => {
	req.logout(error => {
		if (error) {
			return next(error)
		}
		req.flash("success", ("Logged out successfully!"))
		res.redirect("/campgrounds")
	})

})
module.exports = router