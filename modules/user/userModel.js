let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phonenumber: {
        type: String,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    type: {
        type: String,
    },
    social_media_id: {
        type: String,
    },
    verified: {
        type: Boolean,
    },
    isBlocked: {
        type: Boolean,
    },
    isSubscribe: {
        type: Boolean,
        default: false
    },
    newQupeyNotify: {
        type: Boolean,
        default: true
    },
    expQupeyNotify: {
        type: Boolean,
        default: true
    },
    redemptionNotify: {
        type: Boolean,
        default: true
    },
    newBusinessNotify: {
        type: Boolean,
        default: true
    },
    isCouponCreate: {
        type: Boolean,
        default: true
    },
    points: {
        type: Number,
        default: 0
    },
    stripeCustomerId: {
        type: String,
    },
    expiryDate: {
        type: Date
    },
    device_token: {
        type: String,
    },
    device_type: {
        type: String,
        enum: ["iOS", "Android"],
        default: "iOS"
    },
    social_media_type: {
        type: String,
        enum: ["Facebook", "Googleplus"]
    },
    logo: {
        type: String
    },
    user_basic_information: {
        type: String,
        default: ''
    },
    background_image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});
userSchema.statics.list = function (selectData, cb) {

    let query = user.find(selectData.condition).select(_.join(selectData.fields, " "));
    query.sort({"createdAt":-1});
    query.limit(!!selectData.limit ? selectData.limit : 10);
    query.skip(selectData.offset);
    query.exec(cb);
};
let user = mongoose.model('users', userSchema);
module.exports = user;  