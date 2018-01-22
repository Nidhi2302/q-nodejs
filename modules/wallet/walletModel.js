let mongoose = require('mongoose');

let walletSchema = new mongoose.Schema({
    vendor_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    coupon_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"coupons"
    },
    createdAt: {
        type: Date,
        default : new Date(),
    },
});
// couponSchema.statics.list = function(selectData, cb){
    
//     let query = coupon.find(selectData.condition).select(_.join(selectData.fields, " "));
//     query.sort({"createdAt":-1});
//     query.limit(!!selectData.limit ? selectData.limit : 10);
//     query.skip(selectData.offset);
//     query.exec(cb);
// };
let wallet = mongoose.model('wallets', walletSchema);

module.exports = wallet;  