let mongoose = require('mongoose');

let vendorProfileSchema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    profile_discrption: {
        type: String,
        default: ""
    },
    address1: {
        type: String,
        default: ""
    },
    address2: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    zip: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    businessPhone:{
        type: String,
        default: ""
    },
    note: {
        type: String,
        default: ""
    },
    weekhours: {

        type: Array,
    },
    location: {
        type: [Number],
        index : '2dsphere'
    },
    website: {
        type: String,
        default: ""
    },
    twitter: {
        type: String,
        default: ""
    },
    facebook: {
        type: String,
        default: ""
    },
    instagram: {
        type: String,
        default: ""
    },
    video_url:{
        type:String,
        default:""
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

let vendor = mongoose.model('vendorprofiles', vendorProfileSchema);
module.exports = vendor;  