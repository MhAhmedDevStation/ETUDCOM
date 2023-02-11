const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    teamId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Team', 
  },
    senderId: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
    },
    text: {
      type: String,
      max: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
