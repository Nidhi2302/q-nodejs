let mongoose = require('mongoose');

let followerSchema = new mongoose.Schema({
    vendorId:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "users"
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "users"
    },
    status:{
        type : String,
        enum : ["Follow","Unfollow"],
        default : "Unfollow"
    },
    like:{
        type : Boolean,
        default : false
    },
    createdAt: {
        type: Date,
        default : new Date()
    }
});

let follower = mongoose.model('follower', followerSchema);
module.exports = follower;