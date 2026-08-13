const express = require("express")
const router = express.Router()
const catchAsync = require("../utilities/catchAsync")
const users = require("../controllers/users")

router.route("/register")
	.get(users.renderRegister)
	.post(catchAsync(users.register))

	router.route("/login")
	.get(users.renderLogin)
	.post(users.login)

router.get("/auth/google", users.renderGoogleAuth)	

router.get("/auth/google/callback", users.googleAuthLogin, users.googleAuthRedirect)

router.get("/logout", users.logout)

module.exports = router