const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
	const token = req.header("Authorization");
	if (!token) {
		return res.status(401).json("No token provided");
	}


	try {
		const verifiedUser = jwt.verify(token, process.env.secret);
		req.verifiedUser = verifiedUser;
		console.log(verifiedUser.userInfo._id)
		next();
	} catch (err) {
		return res.status(403).json("Invalid token");
	}
};