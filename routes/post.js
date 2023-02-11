const postController = require('../controllers/postController');
const express = require("express");
const router = express.Router();

router.post("/:teamId", postController.creatPost)
router.get("/:teamId", postController.getTeamPosts)
module.exports = router;