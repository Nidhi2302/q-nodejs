let fs = require('fs');
let shareLinkModel = require('./shareLinkModel.js');
let userModel = require('../user/userModel');
let couponModel = require('../coupon/couponModel');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let md5 = require("js-md5");
let mongoose = require('mongoose');
let shareLinkCtr = {};
let apn = require("apn");


shareLinkCtr.saveLinks = (req, res) => {
    let userID = jwt.getUserId(req.headers['x-auth-token']);
    let linkData={
            userId:userID,
            vendorId:req.body.vendorId,
            couponId:req.body.couponId,
            link:req.body.link,
    }
        shareLinkModel.findOneAndUpdate({ "userId": mongoose.Types.ObjectId(userID)},linkData,{ upsert: true, new: true }, (err2, MsgResult) => {
            console.log(err2, MsgResult);
            if (err2) {
                res.status(400).json(req.t("NO_RECORD_FOUND"));
            } else {
                res.status(200).json( req.t('SUCCESS'));
            }
        });
    
}

module.exports = shareLinkCtr;