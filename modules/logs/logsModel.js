let mongoose = require('mongoose');

let redeemSchema = new mongoose.Schema({
    logsString :Object,
    type :{
        type:String
    },
    module:{
        type:String
    },
    createdAt: {
        type: Date,
        default : new Date()
    }
});
let redeem = mongoose.model('logs', redeemSchema);
module.exports = redeem;