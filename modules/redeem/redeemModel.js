let mongoose = require('mongoose');

let redeemSchema = new mongoose.Schema({
    vendorId:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "users"
    },
    couponId:{
        type : mongoose.Schema.Types.ObjectId,
        required : false,
        ref : "coupons"
    },
    used:{
        type:Boolean
    },
    punch_count: {
        type: Number,
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "users"
    },
    createdAt: {
        type: Date,
        default : new Date()
    }
});
// redeemSchema.statics.redeemCouponById = function (selectData, cb) {
//     this.find({ "couponId": selectData.couponId, "type": "coupon" })
// 		.populate('vendor_id', 'email city')
//         .limit(!!selectData.limit ? selectData.limit : 10)
//         .skip(!!selectData.offset ? selectData.offset : 0)
//         .exec(cb);
// };  

let redeem = mongoose.model('redeems', redeemSchema);
module.exports = redeem;