const mongoose = require('mongoose');
const  Post  = require('../models/post');

creatPost = async (req, res) => {
    let post = new Post({
        teamId: req.params.teamId,
        senderId: req.query.senderId,
        text: req.body.text
    });
    post = await post.save();

    if (!post) return res.status(400).send('the post cannot be created!');

    res.send(post);
};
getTeamPosts = async (req, res) => {
    let filter = {};
    if (req.params.teamId) {
        filter = { teamId: req.params.teamId };
    }
    const postList = await Post.find(filter)
        .populate({ path: 'senderId', select: 'userName + imageURL' })
        .populate({ path: 'teamId', select: 'name' });

    if (!postList) {
        res.status(500).json({ success: false });
    }
    res.send(postList);
};

module.exports = {
    creatPost,
    getTeamPosts
};
