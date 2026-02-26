const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utilities/catchAsync")
router.get("/register", (req, res) => {
	res.render("users/register")
})
router.post("/register", catchAsync(async (req, res) => {
	try {
		const { username, email, password } = req.body
		const user = await new User({ username, email })
		const registeredUser = await User.register(user, password)
	}catch(e) {
		req.flash("error", e.message)
		res.redirect("/register")
	}
	req.flash("success", "Welcome to Yelpcamp!")
	res.redirect("/campgrounds")
}))
module.exports = router