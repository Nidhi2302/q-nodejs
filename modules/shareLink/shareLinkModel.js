let mongoose = require('mongoose');

let shareLinkSchema = new mongoose.Schema({
   
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    vendorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    couponId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"coupons"
    },
    link:{
        type: String
    },
    createdAt: {
        type: Date,
        default : new Date(),
    },
});

let shareLink = mongoose.model('shareLinks', shareLinkSchema);

module.exports = shareLink;  