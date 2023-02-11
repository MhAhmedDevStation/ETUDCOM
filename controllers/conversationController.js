const mongoose = require('mongoose');
const { findByIdAndUpdate } = require('../models/conversation');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
getConversationOrCreate = async (req, res) => {
    let filter = {};
    if (req.params.myId) {
        filter = { members: { $all: [req.params.myId, req.params.userId] } };
    }
    try {
        const conversation = await Conversation.findOneAndUpdate(
            filter,
            { $set: { updatedAt: Date.now() } },
            { new: true }
        );
        if (conversation) {
            res.status(200).json(conversation);
        } else {
            const newConversation = new Conversation({
                members: [req.params.myId, req.params.userId]
            });
            try {
                const savedConversation = await newConversation.save();
                res.status(200).json(savedConversation);
            } catch (err) {
                res.status(500).json(err);
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

creatMessage = async (req, res) => {
    // send msg
    let message = new Message({
        conversationId: req.params.conversationId,
        senderId: req.params.senderId,
        text: req.body.text
    });
    message = await message.save();
    // after send msg -> update conv en question (updatedAt)
    await Conversation.findByIdAndUpdate(
        req.params.conversationId,
        { $set: { updatedAt: Date.now() } },
        { new: true }
    );
    if (!message) return res.status(400).send('the Message cannot be created!');

    res.send(message);
};

// getConversations = async (req, res) => {
//     try {
//         const conversations = await Conversation.find();
//         return res.status(200).json(conversations);
//     } catch (err) {
//         return res.status(500).json(err);
//     }
// };
// getConversation = async (req, res) => {
//     const conversation = req.conversation;
//     await conversation.populate({
//         path: 'messages'
//     });
//     try {
//         return res.status(200).json(conversation);
//     } catch (err) {
//         return res.status(500).json(err);
//     }
// };
deleteConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndDelete(req.conversation.id);
        return res.status(200).json(conversation);
    } catch (err) {
        return res.status(500).json(err);
    }
};
updateConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndUpdate(req.conversation.id, req.body, {
            new: true
        });
        return res.status(200).json(conversation);
    } catch (err) {
        return res.status(500).json(err);
    }
};
getOwnedConversations = async (req, res) => {
    try {
        var mysort = { updatedAt: -1 };
        const conversations = await Conversation.find({
            members: { $in: [req.params.myId] }
        })
            .populate({
                path: 'members',
                select: 'userName + imageURL'
            })
            .sort(mysort);
        return res.status(200).json(conversations);
    } catch (err) {
        return res.status(500).json(err);
    }
};
getMessageConvo = async (req, res) => {
    let filter = {};
    if (req.params.myId) {
        filter = { members: { $all: [req.params.myId, req.params.userId] } };
    }
    const conversation = await Conversation.findOneAndUpdate(
        filter,
        { $set: { updatedAt: Date.now() } },
        { new: true }
    );

    try {
        const message = await Message.find({ conversationId: conversation.id }).populate({
            path: 'senderId',
            select: 'userName + imageURL'
        });

        if (!message) {
            return res.status(404).json('no message found');
        }
        return res.status(200).json(message);
    } catch (err) {
        return res.status(500).json(err);
    }
};

///////////////

module.exports = {
    getMessageConvo,
    getOwnedConversations,
    updateConversation,
    deleteConversation,
    // getConversation,
    // getConversations,
    getConversationOrCreate,
    creatMessage
};
