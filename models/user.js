const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    userName: {
        type:String,
        required:true
    },
    cin: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    resetLink:{
        data: String,
        default: '',
    },
    role:{
        type:String,
        required:true,
    },
    isActive:{
        type:Boolean,
        default:'false'
    },
    isRejected:{
        type:Boolean,
        default:'false'
    },
    imageURL: {
        type: String,
        default:'http://localhost:5000/uploads/default.jpg'
    }
    
},
{ timestamps: true });

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
