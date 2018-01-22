let mongoose = require('mongoose');

let adminSchema = new mongoose.Schema({
    email : {
        type : String,
    },
    password: {
        type: String,
    },
    createdAt: {
        type: Date,
        default : new Date(),
    }
});

let admin = mongoose.model('admins', adminSchema);
module.exports = admin;  