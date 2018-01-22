let fs = require('fs');
let couponHelper = require('./couponHelper.js');
let couponModel = require('./couponModel.js');
let redeemModel = require('../redeem/redeemModel');
let userModel = require('../user/userModel');
let shareModel = require('../shareLink/shareLinkModel');
let walletModel = require('../wallet/walletModel');
let subscripbe = require('../payment/paymentModel');
let jwt = require('../../helper/jwt.js');
let notificationUtility = require('../../helper/notificationUtils');
let utils = require('../../helper/utils.js');
let md5 = require("js-md5");
let mongoose = require('mongoose');
let couponCtr = {};
couponCtr.createCoupon = (req, res) => {
    var couponPost = {
        vendor_id: jwt.getUserId(req.headers['x-auth-token']),
        coupon_name: req.body.coupon_name,
        discount_type: req.body.discount_type,
        qupey_type: req.body.qupey_type,
        available_amount: (req.body.available_amount != "") ? req.body.available_amount : "",
        purchase_amount: (req.body.purchase_amount != "") ? req.body.purchase_amount : "",
        actual_count: (req.body.actual_count != "") ? req.body.actual_count : "",
        discription: req.body.discription,
        launch_date: new Date(req.body.launch_date),
        expiration_date: new Date(req.body.expiration_date),
        available_to: req.body.available_to,
        terms_condition: req.body.terms_condition,
        redumption_code: req.body.redumption_code,
        createdAt: new Date()
    }
    console.log(couponPost);
    let coupon = new couponModel(couponPost);
    coupon.save((err, result) => {
        console.log(err, result);
        if (!utils.isDefined(err)) {
            res.status(200).json({
                "message": req.t('COUPONADDED'),
                "_id": result._id
            });
        } else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
        }
    });
}
couponCtr.currentCouponInventory = (req, res) => {

    let userId = 0;
    let vendorID = req.params.vendor_id;
    if (vendorID == 0) {
        vendorID = jwt.getUserId(req.headers['x-auth-token']);
    }
    else {
        userId = jwt.getUserId(req.headers['x-auth-token']);
    }
    console.log("IDs", userId, vendorID, req.params.vendor_id);
    let offset = 0;
    if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
        offset = ((req.params.start - 1) * parseInt(process.env.MAX_RECORD));
    }
    let now = new Date();
    let date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0);

    couponModel.count(
        {
            'vendor_id': mongoose.Types.ObjectId(vendorID),
            "expiration_date": {
                $gt: new Date(date)
            }
        }, (err, count) => {
            console.log("current count", count);
            if (!err) {
                couponModel.aggregate([
                    {
                        $match:
                        {
                            $and: [{ 'vendor_id': mongoose.Types.ObjectId(vendorID) }, { "expiration_date": { $gte: new Date(date) } }]
                        }
                    },


                    { $sort: { "createdAt": -1 } },
                    { $limit: offset + parseInt(process.env.MAX_RECORD) },
                    { $skip: offset },


                    {
                        $lookup: {
                            from: "wallets",
                            localField: "_id",
                            foreignField: "coupon_id",
                            as: "savecoupons"
                        }
                    },
                    {
                        $unwind: {
                            path: '$savecoupons',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "redeems",
                            localField: "_id",
                            foreignField: "couponId",
                            as: "redeemcoupons"
                        }
                    },
                    {
                        $unwind: {
                            path: '$redeemcoupons',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $group: {
                            "_id": "$_id",
                            "saved": {
                                $push: {
                                    $cond: [{ $eq: ["$savecoupons.user_id", mongoose.Types.ObjectId(userId)] }, 1, 0
                                    ]
                                }
                            },

                            "coupon_name": { $first: "$coupon_name" },
                            "expiration_date": { $first: "$expiration_date" },
                            "qupey_type": { $first: "$qupey_type" },
                            "coupon_status": { $first: "$coupon_status" },
                            "discription": { $first: "$discription" },
                            "available_to": { $first: "$available_to" },
                            "createdAt": { $first: "$createdAt" },
                            "discount_type": { $first: "$discount_type" },
                            "terms_condition": { $first: "$terms_condition" },
                            "available_amount": { $first: "$available_amount" },
                            "purchase_amount": { $first: "$purchase_amount" },
                            "actual_count": { $first: "$actual_count" },
                            "punch_count": { $first: 0 },
                            "payment": { $first: false },
                            "purchase_amount": { $first: "$purchase_amount" },
                            "launch_date": { $first: "$launch_date" },
                            "available_to": { $first: "$available_to" },
                            "redumption_code": { $first: "$redumption_code" },
                            "redeemcoupons": { $push: "$redeemcoupons" }
                        }
                    },
                    {
                        $project: {
                            "_id": 1,
                            "saved": { $sum: "$saved" },
                            "coupon_name": 1,
                            "expiration_date": 1,
                            "qupey_type": 1,
                            "coupon_status": 1,
                            "discription": 1,
                            "available_to": 1,
                            "createdAt": 1,
                            "discount_type": 1,
                            "terms_condition": 1,
                            "available_amount": 1,
                            "purchase_amount": 1,
                            "actual_count": 1,
                            "purchase_amount": 1,
                            "launch_date": 1,
                            "payment": 1,
                            "available_to": 1,
                            "punch_count": 1,
                            "redumption_code": 1,
                            "redeemcoupons": 1

                        }
                    },
                    { $sort: { "createdAt": -1 } },
                ],
                    (err, result) => {
                        console.log(err)
                        if (!err) {
                            if (vendorID != 0) {
                                let newResult = [];
                                result.map((coupon) => {
                                    coupon.redeemcoupons.map((redeem) => {
                                        if (redeem.userId) {
                                            if (redeem.userId.toString() == userId.toString()) {
                                                if (!redeem.used) {
                                                    coupon.punch_count = redeem.punch_count;
                                                    coupon.payment = true;
                                                }
                                                else {
                                                    newResult.push(coupon._id);
                                                }
                                            }
                                        }
                                        return redeem;
                                    })
                                    delete coupon.redeemcoupons;
                                    return coupon;
                                })
                                result = result.filter((re) => newResult.indexOf(re._id) < 0)
                                result = result.filter((re2) => {
                                    if (re2.qupey_type == "Advance Purchase Required" && re2.available_amount == 0) {
                                        return false;
                                    }
                                    else {
                                        return true;
                                    }
                                })
                            }
                            response = {
                                'data': result,
                                'message': req.t('SUCCESS'),
                                'count': count
                            }
                            return res.status(200).json(response);
                        } else {
                            return res.status(400).json(req.t("NO_RECORD_FOUND"));
                        }
                    });
            } else {
                return res.status(400).json(req.t("NO_RECORD_FOUND"));
            }
        })

}
couponCtr.expireCouponInventory = (req, res) => {
    let vendorID = jwt.getUserId(req.headers['x-auth-token']);
    let now = new Date();
    let date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0);
    let params_ = {
        fields: ["_id", "coupon_name", "expiration_date", "qupey_type", "coupon_status", "discription"],
        limit: parseInt(process.env.MAX_RECORD),
        offset: 0,
        condition: {
            'vendor_id': mongoose.Types.ObjectId(vendorID),
            "expiration_date": { $lt: new Date(date) }
        }
    };
    if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
        params_.offset = ((req.params.start - 1) * process.env.MAX_RECORD);
    }
    couponModel.count(
        {
            'vendor_id': mongoose.Types.ObjectId(vendorID),
            "expiration_date": {
                $lt: new Date(date)
            }
        }, (err, count) => {
            console.log("expiry count", count);
            if (!err) {
                couponModel.list(params_, (err, result) => {
                    if (result.length > 0) {
                        response = {
                            'data': result,
                            'message': req.t('SUCCESS'),
                            'count': count
                        }
                        return res.status(200).json(response);
                    } else {
                        return res.status(400).json(req.t("NO_RECORD_FOUND"));
                    }
                });
            } else {
                return res.status(400).json(req.t("NO_RECORD_FOUND"));
            }
        })
}
couponCtr.getCoupon = (req, res) => {
    couponModel.aggregate([
        {
            $match: { "_id": mongoose.Types.ObjectId(req.params.id) }
        },
        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "vendordetail"
            }
        },
        {
            $unwind: {
                path: '$vendordetail'
            }
        },
        {
            $lookup: {
                from: "vendorprofiles",
                localField: "vendor_id",
                foreignField: "vendor_id",
                as: "vendorprofile"
            }
        },
        {
            $unwind: {
                path: '$vendorprofile'
            }
        },
        {
            $group: {
                "_id": "$_id",
                "vendor_id": { $first: "$vendor_id" },
                "coupon_name": { $first: "$coupon_name" },
                "vendorname": { $first: "$vendordetail.name" },
                "discount_type": { $first: "$discount_type" },
                "qupey_type": { $first: "$qupey_type" },
                "discription": { $first: "$discription" },
                "coupon_status": { $first: "$coupon_status" },
                "terms_condition": { $first: "$terms_condition" },
                "expiration_date": { $first: "$expiration_date" },
                "available_amount": { $first: "$available_amount" },
                "purchase_amount": { $first: "$purchase_amount" },
                "actual_count": { $first: "$actual_count" },
                "punch_count": { $first: 0 },
                "purchase_amount": { $first: "$purchase_amount" },
                "launch_date": { $first: "$launch_date" },
                "available_to": { $first: "$available_to" },
                "redumption_code": { $first: "$redumption_code" },
                "address1": { $first: "$vendorprofile.address1" },
                "address2": { $first: "$vendorprofile.address2" },
                "logo_url": { $first: { $concat: [config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH, "$vendordetail.logo"] } },
                "city": { $first: "$vendorprofile.city" },
                "state": { $first: "$vendorprofile.state" },
                "zip": { $first: "$vendorprofile.zip" },
            }
        }
    ], (err, couponResult) => {
        if (err) {
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        } else {
            response = {
                'data': couponResult,
                'message': req.t('SUCCESS')
            }
            res.status(200).json(response);
        }
    });
}
couponCtr.getCouponCount = (req, res) => {
    let vendorID = jwt.getUserId(req.headers['x-auth-token'])
    subscripbe.aggregate({
        $match: {
            "vendor_id": mongoose.Types.ObjectId(vendorID)
        }
    },

        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "user"
            },

        },
        {
            $lookup: {
                from: "coupons",
                localField: "vendor_id",
                foreignField: "vendor_id",
                as: "couponDetail"
            },

        },
        { $limit: 1 },
        { $sort: { _id: -1 } },
        function (err, couponResults) {
            console.log(couponResults);
            let plan = JSON.parse(config.STRIPE_PLAN);
            let planDetail = _.find(plan, ['plan', couponResults[0].subscriptionPlan]);
            if (utils.isDefined(planDetail)) {
                if (planDetail.coupon != "Unlimited") {
                    if (couponResults[0].user[0].isCouponCreate) {
                        if (couponResults[0].couponDetail.length < planDetail.coupon) {
                            response = {
                                'message': req.t('SUCCESS')
                            }
                            res.status(200).json(response);
                        } else {
                            res.status(400).json(req.t("NO_COUPON_AVILABLE"));
                        }
                    }
                    else {
                        res.status(400).json(req.t("NO_COUPON_AVILABLE"));
                    }

                } else {
                    if (couponResults[0].user[0].isCouponCreate) {
                        response = {
                            'message': req.t('SUCCESS')
                        }
                        res.status(200).json(response);
                    }
                    else {
                        res.status(400).json(req.t("NO_COUPON_AVILABLE"));
                    }
                }

            }
        });
}
couponCtr.deleteCoupon = (req, res) => {
    //console.log("delete coupon",req.body.id);
    couponModel.remove({
        "_id": mongoose.Types.ObjectId(req.params.id)
    }, (err, result) => {
        // console.log(err,result);
        if (!err) {
            if (JSON.parse(result).n != 0) {
                res.status(200).json(req.t("DELETE_SUCCESS"));
            }
            else {
                res.status(400).json(req.t("NO_RECORD_FOUND"));
            }
        }
        else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));

        }
    })


}
couponCtr.publishCoupon = (req, res) => {
    // console.log("publish coupon", req.body.id);
    couponModel.findOneAndUpdate({
        "_id": mongoose.Types.ObjectId(req.body.id)
    }, { "coupon_status": req.body.coupon_status }, { upsert: true, new: true }, (err, result) => {
        //console.log("publish", err, result);

        userModel.findOne({ "_id": result.vendor_id }, (err2, result2) => {
            // console.log("err2,result2", err2, result2);
            let notifyMsg = ""
            let htmlMsg = ""
            switch (result.discount_type) {
                case "Percentage":
                    notifyMsg = req.t("NEW_QUPEY_FIRST") + result.qupey_type + " Your First Purchase" + req.t("NEW_QUPEY_LAST");
                    htmlMsg = req.t("DIV_DES_START") + req.t("NEW_QUPEY_FIRST") + req.t("SPAN_START") + result.qupey_type + " Your First Purchase" + req.t("SPAN_END") + req.t("NEW_QUPEY_LAST");
                    break;
                case "Dollar Amount":
                    notifyMsg = req.t("NEW_QUPEY_FIRST") + result.coupon_name + req.t("NEW_QUPEY_LAST");
                    htmlMsg = req.t("DIV_DES_START") + req.t("NEW_QUPEY_FIRST") + req.t("SPAN_START") + result.coupon_name + req.t("SPAN_END") + req.t("NEW_QUPEY_LAST");
                    break;
                case "Punchcard":
                    notifyMsg = req.t("NEW_QUPEY_FIRST") + result.qupey_type + req.t("NEW_QUPEY_LAST");
                    htmlMsg = req.t("DIV_DES_START") + req.t("NEW_QUPEY_FIRST") + req.t("SPAN_START") + result.qupey_type + req.t("SPAN_END") + req.t("NEW_QUPEY_LAST");
                    break;
                case "Other":
                    notifyMsg = req.t("NEW_QUPEY_FIRST") + result.coupon_name + req.t("NEW_QUPEY_LAST");
                    htmlMsg = req.t("DIV_DES_START") + req.t("NEW_QUPEY_FIRST") + req.t("SPAN_START") + result.coupon_name + req.t("SPAN_END") + req.t("NEW_QUPEY_LAST");
                    break;
                default:
                    notifyMsg = req.t("NEW_QUPEY_FIRST") + result.coupon_name + req.t("NEW_QUPEY_LAST");
                    htmlMsg = req.t("DIV_DES_START") + req.t("NEW_QUPEY_FIRST") + req.t("SPAN_START") + result.coupon_name + req.t("SPAN_END") + req.t("NEW_QUPEY_LAST");
                    break;
            }
            if (result.available_to.length != 0 && result.available_to[0] == "All Followers") {

                userModel.find({ "type": "user", "newQupeyNotify": true }, (err, users) => {
                    let devices = users.map((user) => { return {type:user.device_type,token:user.device_token} })
                    notificationUtility.notifyToMany(devices, notifyMsg + result2.name, htmlMsg + req.t("SPAN_START") + result2.name + req.t("SPAN_END") + req.t("DIV_END"))
                })
            }
            else if (result.available_to.length != 0) {
                let userIds = result.available_to.map(userID => { return mongoose.Types.ObjectId(userID.userId) });
                

                userModel.find({ "_id": { $in: userIds } }, (err, users) => {
                    console.log(users);
                    let devices = users.map((user) => {
                        if (user.newQupeyNotify) {
                            console.log(user);
                            return {type:user.device_type,token:user.device_token}
                        }
                    })
                    console.log(devices);
                    notificationUtility.notifyToMany(devices, notifyMsg + result2.name, htmlMsg + req.t("SPAN_START") + result2.name + req.t("SPAN_END") + req.t("DIV_END"))
                })
            }

            if (!err && result) {
                res.status(200).json(req.t("PUBLISH_COUPON"));
            }
            else {
                res.status(400).json(req.t("PLEASE_TRY_AGAIN"));

            }
        })

    })


}
couponCtr.updateCoupon = (req, res) => {
    //console.log("update coupon",req.body);
    let updatedcoupon = {
        vendor_id: jwt.getUserId(req.headers['x-auth-token']),
        coupon_name: req.body.coupon_name,
        discount_type: req.body.discount_type,
        qupey_type: req.body.qupey_type,
        available_amount: (req.body.available_amount != "") ? req.body.available_amount : "",
        purchase_amount: (req.body.purchase_amount != "") ? req.body.purchase_amount : "",
        actual_count: (req.body.actual_count != "") ? req.body.actual_count : "",
        discription: req.body.discription,
        launch_date: new Date(req.body.launch_date),
        expiration_date: new Date(req.body.expiration_date),
        available_to: req.body.available_to,
        terms_condition: req.body.terms_condition,
        redumption_code: req.body.redumption_code,
    }
    //console.log(updatedcoupon);
    couponModel.findOneAndUpdate({
        "_id": mongoose.Types.ObjectId(req.body.id)
    }, updatedcoupon, { upsert: true, new: true }, (err, result) => {
        //console.log(err,result);
        if (!err && result) {
            let reaponse = {
                "data": result,
                "message": req.t("UPDATE_COUPON")
            }
            res.status(200).json(reaponse);
        }
        else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));

        }
    })


}
couponCtr.redeemCoupon = (req, res) => {
    let counpon_used = false;
    let userId = jwt.getUserId(req.headers['x-auth-token'])
    let removeCoupon = {
        "coupon_id": req.body.couponId,
        "user_id": userId,
        "vendor_id": req.body.vendorId
    }
    let condition = {
        vendorId: req.body.vendorId,
        couponId: req.body.couponId,
        userId: userId,
    }
    console.log(couponRedeemPost);
    if (req.body.coupon_type == "Punchcard") {
        if (req.body.punch_count == req.body.actual_count + 1) {
            counpon_used = true;
        }


    }
    else if (req.body.coupon_type == "Percentage") {
        counpon_used = true;
    }
    else {
        counpon_used = true;
    }
    var couponRedeemPost = {
        vendorId: req.body.vendorId,
        couponId: req.body.couponId,
        userId: userId,
        used: counpon_used,
        punch_count: req.body.punch_count
    }
    let couponRedeem = new redeemModel(couponRedeemPost);
    redeemModel.findOneAndUpdate(condition, couponRedeemPost, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, result) => {
        console.log(req.body.sharedUser, userId);
        if (counpon_used) {
            console.log("req.body.sharedUser",req.body.sharedUser);
            if (req.body.sharedUser != userId) {
                if (req.body.sharedUser != "") {
                    shareModel.findOne({ _id: mongoose.Types.ObjectId(req.body.sharedUser) }, (linkErr, link) => {
                        if (!link) {
                            userModel.findOne({ _id: mongoose.Types.ObjectId(req.body.sharedUser) }, (userErr, user) => {
                                let updatePoints = user.points + 10
                                utils.modifyField('users', { _id: mongoose.Types.ObjectId(req.body.sharedUser) }, { points: updatePoints }, (updateErr, results) => {
                                    console.log("points update to 10", results);
                                    let notifyMsg = "A Qupey " + req.body.couponDec + " that you shared with " + req.body.redeemer + " has been redeemed by " + req.body.redeemer
                                    let htmlMsg = req.t("DIV_DES_START") + "A Qupey " + req.t("SPAN_START") + req.body.couponDec + req.t("SPAN_END") + " that you shared with " + req.t("SPAN_START") + req.body.redeemer + req.t("SPAN_END") + " has been redeemed by " + req.t("SPAN_START") + req.body.redeemer + req.t("SPAN_END") + req.t("DIV_END")
                                    if (user.redemptionNotify) {
                                        notificationUtility.notifyToMany([{type:user.device_type,token:user.device_token}], notifyMsg, htmlMsg);
                                    }
                                })
                            })
                        }
                    })
                }
            }

            userModel.findOne({ _id: userId }, (userErr, user) => {
                let updatePoints = user.points + 5

                utils.modifyField('users', { _id: mongoose.Types.ObjectId(userId) }, { points: updatePoints }, (updateErr, results) => {
                    console.log("points update to 5", results);
                    walletModel.remove(removeCoupon, (error, result3) => {
                        if (!utils.isDefined(error)) {
                            let notifyMsg = "A Qupey " + req.body.couponDec + " has been redeemed"
                            let htmlMsg = req.t("DIV_DES_START") + "A Qupey " + req.t("SPAN_START") + req.body.couponDec + req.t("SPAN_END") + " has been redeemed " + req.t("DIV_END")
                            if (user.redemptionNotify) {
                                notificationUtility.notifyToMany([{type:user.device_type,token:user.device_token}], notifyMsg, htmlMsg);
                            }
                            res.status(200).json({
                                "message": req.t('COUPONREDEEM'),
                                "_id": result._id
                            });
                        } else {
                            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
                        }
                    });
                });
            })


        }
        else {
            if (!utils.isDefined(err)) {
                res.status(200).json({
                    "message": req.t('COUPONREDEEM'),
                    "_id": result._id
                });

            } else {
                res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
            }
        }

    });
}

module.exports = couponCtr;