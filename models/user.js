const mongoose = require("mongoose")

const passportLocalMongoose = require("passport-local-mongoose")

const findOrCreate = require("mongoose-findorcreate")

const Schema = mongoose.Schema

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	googleId: {
		type: String,
		unique: true,
		sparse: true
	}
})

UserSchema.plugin(passportLocalMongoose)

UserSchema.plugin(findOrCreate)

module.exports = mongoose.model("User", UserSchema)