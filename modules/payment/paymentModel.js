let mongoose = require('mongoose');

let userSubscriptionSchema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    amount : {
        type : Number,
    },
    currency : {
        type : String
    },
    subscriptionId : {
        type : String
    },
    
    subscriptionPlan:{
        type : String,
    },
    customerId : {
        type : String
    },
    created: {
        type: Date,
        default : new Date()
    },
});

let userSubscription = mongoose.model('venderSubscriptions', userSubscriptionSchema);
module.exports = userSubscription;