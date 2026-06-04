const express = require("express")
const router = express.Router()
const catchAsync = require("../utilities/catchAsync")
const users = require("../controllers/users")

router.get("/register", users.renderRegister)

router.post("/register", catchAsync(users.register))

router.get("/login", users.renderLogin)

router.post("/login", users.login)

router.get("/logout", users.logout)

module.exports = router