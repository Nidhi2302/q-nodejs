let mongoose = require('mongoose');

let couponSchema = new mongoose.Schema({
    vendor_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    coupon_name : {
        type: String,
    },
    discount_type : {
        type: String,
        enum: [ 'Percentage','Dollar Amount', 'Punchcard', 'Other']
    },
    qupey_type: {
        type: String,
    },
    available_amount: {
        type: String,
    },
    purchase_amount: {
        type: String,
    },
    actual_count: {
        type: Number,
    },
   
    discription: {
        type: String,
    },
    launch_date: {
        type: Date,
    },
    expiration_date: {
        type: Date,
    },
    available_to:{
        type: Array,
    },
    terms_condition:{
        type: String,
    },
    redumption_code:{
        type: String,
    },
    
    coupon_status:{
        type:String,
        enum:["publish","unpublish"],
        default:"unpublish"
    },
    createdAt: {
        type: Date,
        default : new Date(),
    },
});
couponSchema.statics.list = function(selectData, cb){
    
    let query = coupon.find(selectData.condition).select(_.join(selectData.fields, " "));
    query.sort({"createdAt":-1});
    query.limit(!!selectData.limit ? selectData.limit : 10);
    query.skip(selectData.offset);
    query.exec(cb);
};
let coupon = mongoose.model('coupons', couponSchema);

module.exports = coupon;  