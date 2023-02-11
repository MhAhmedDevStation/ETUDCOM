const mongoose = require('mongoose');


const teamSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    group: {
        type: String,
        required:true,

    },
    subject: {
        type: String,
        required:true,

    },
    name: {
        type: String,
        required:true,

    },
    description: {
        type: String,
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        
    }],
    image: {
        type: String,
        default:""
    },
},
{ timestamps: true });

teamSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

teamSchema.set('toJSON', {
    virtuals: true,
});
teamSchema.methods.addMember = async function (id) {
	if (this.members.indexOf(id) === -1) {
		this.members.push(id);
	}
	return await this.save();
};
exports.Team = mongoose.model('Team', teamSchema);
exports.teamSchema = teamSchema;
