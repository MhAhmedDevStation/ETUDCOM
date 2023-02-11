const conversationController = require('../controllers/conversationController');
const express = require("express");
const router = express.Router();
const verifyToken=require ('../helpers/verifyToken')



// router.get("/",conversationController.getConversations);
router.get("/:myId", conversationController.getOwnedConversations);
// router.get("/:Conversation", conversationController.getConversation);
// router.get('/conv', conversationController.getUserConv)
// router.get("/conv/:Conversation", conversationController.getMessagesbyId);

router.get("/:myId/:userId/getmesages",  conversationController.getMessageConvo);
router.get("/:myId/:userId", conversationController.getConversationOrCreate);
// router.put("/:Conversation", verifyToken,  conversationController.updateConversation);
// router.delete("/:Conversation", verifyToken, conversationController.deleteConversation);
router.post("/send/:conversationId/:senderId",  conversationController.creatMessage);
module.exports = router;