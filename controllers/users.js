const User = require("../models/user")
const passport = require("passport")

module.exports.renderRegister = (req, res) => {
	res.render("users/register")
}

module.exports.register = async (req, res) => {
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
}

module.exports.renderLogin = (req, res) => {
	res.render("users/login")
}

module.exports.login = (req, res, next) => {
	const redirectUrl = req.session.returnTo || "/campgrounds"
	passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }, (err, user) => {
		if (err) return next(err)
		if (!user) {
			req.flash("error", "Invalid username or password! Please try again.")
			return res.redirect("/login")
		}
		req.logIn(user, (err) => {
			if (err) return next(err)
			req.flash("success", "Welcome back to Yelpcamp!")
			delete req.session.returnTo
			res.redirect(redirectUrl)
		})
	})(req, res, next)
}

module.exports.logout = (req, res) => {
	req.logout(error => {
		if (error) {
			return next(error)
		}
		req.flash("success", ("Logged out successfully!"))
		res.redirect("/campgrounds")
	})

}