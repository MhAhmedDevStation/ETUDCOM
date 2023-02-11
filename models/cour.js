const mongoose = require('mongoose');

const courSchema = new mongoose.Schema(
    {
        courName:{
            type:String
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        files: [
            {
                type: String
            }
        ],
        fNames:[{
            type:String
        }]
    },
    
    { timestamps: true }
);

module.exports = mongoose.model('Cour', courSchema);
