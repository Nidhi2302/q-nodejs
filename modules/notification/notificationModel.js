let mongoose = require('mongoose');

let notificationSchema = new mongoose.Schema({
   
    device_token:{
        type:String
    },
    notifyMsg:{
        type: String
    },
    orginalMsg:{
        type:String
    },
    createdAt: {
        type: Date,
        default : new Date(),
    },
});

let notification = mongoose.model('notifications', notificationSchema);

module.exports = notification;  