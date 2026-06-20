const AWS = require('aws-sdk');

const multer = require('multer');

const multerS3 = require('multer-s3');

const path = require('path');

const s3 = new AWS.S3({
	endpoint: process.env.ARVAN_ENDPOINT,
	accessKeyId: process.env.ARVAN_ACCESS_KEY,
	secretAccessKey: process.env.ARVAN_SECRET_KEY,
	s3ForcePathStyle: true,
	signatureVersion: 'v4',
});

module.exports.upload = multer({
	storage: multerS3({
		s3,
		bucket: process.env.ARVAN_BUCKET,
		acl: 'public-read',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function (req, file, cb) {
			const uniqueName = "Yelpcamp" + "-" + file.originalname;
			cb(null, uniqueName);
		},
	}),
	limits: { fileSize: 15 * 1024 * 1024, files: 5 },
	fileFilter: function (req, file, cb) {
		const allowed = /jpeg|jpg|png|webp/;
		const valid = allowed.test(path.extname(file.originalname).toLowerCase());
		cb(null, valid);
	},
});

module.exports.deleteFromArvan = async (key) => {
	await s3.deleteObject({
		Bucket: process.env.ARVAN_BUCKET,
		Key: key,
	}).promise();
};


