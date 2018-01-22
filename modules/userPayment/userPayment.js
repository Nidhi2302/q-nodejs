let mongoose = require('mongoose');

let userSubscriptionSchema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coupons'
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    amount : {
        type : Number,
    },
    currency : {
        type : String
    },
    paymentId : {
        type : String
    },
   
    created: {
        type: Date,
        default : new Date()
    },
});

let userSubscription = mongoose.model('userSubscriptions', userSubscriptionSchema);
module.exports = userSubscription;