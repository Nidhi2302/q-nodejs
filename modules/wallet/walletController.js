let fs = require('fs');
let walletHelper = require('./walletHelper.js');
let walletModel = require('./walletModel.js');
let subscripbe = require('../payment/paymentModel');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let md5 = require("js-md5");
let mongoose = require('mongoose');
let walletCtr = {};
walletCtr.saveCoupon = (req, res) => {
    let userId = jwt.getUserId(req.headers['x-auth-token']);
    var couponPost = {
        vendor_id: req.body.vendor_id,
        user_id: userId,
        coupon_id: req.body.coupon_id
    }
    console.log(couponPost);
    let coupon = new walletModel(couponPost);
    walletModel.findOneAndUpdate({
        "$and": [
            { "vendor_id": mongoose.Types.ObjectId(req.body.vendor_id) },
            { "coupon_id": mongoose.Types.ObjectId(req.body.coupon_id) },
            { "user_id": mongoose.Types.ObjectId(userId) }]
    }, couponPost, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, result) => {
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
walletCtr.getCoupon = (req, res) => {
    let userID = jwt.getUserId(req.headers['x-auth-token']);
    let now = new Date();
    let date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0);
    walletModel.aggregate([
        {
            $match: { "user_id": mongoose.Types.ObjectId(userID) }
        },
        {
            $lookup: {
                from: "coupons",
                localField: "coupon_id",
                foreignField: "_id",
                as: "coupondetails"
            }
        },
        {
            $unwind: {
                path: '$coupondetails'
            }
        },
        {
            $match: {
                "coupondetails.expiration_date": {
                    $gt: new Date(date)
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "userprofile"
            }
        },
        {
            $unwind: {
                path: '$userprofile'
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
            $lookup: {
                from: "redeems",
                localField: "coupon_id",
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
        // {
        //     $match: { 'redeemcoupons.used': { $ne: true } }
        // },

        {
            $group: {
                "_id": "$_id",
                "coupon_id": { $first: "$coupondetails._id" },
                "coupon_name": { $first: "$coupondetails.coupon_name" },
                "logo_url": { $first: { $concat: [config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH, "$userprofile.logo"] } },
                "discount_type": { $first: "$coupondetails.discount_type" },
                "qupey_type": { $first: "$coupondetails.qupey_type" },
                "discription": { $first: "$coupondetails.discription" },
                "coupon_status": { $first: "$coupondetails.coupon_status" },
                "expiration_date": { $first: "$coupondetails.expiration_date" },
                "vendorname": { $first: "$userprofile.name" },
                "vendor_id": { $first: "$userprofile._id" },
                "terms_condition": { $first: "$coupondetails.terms_condition" },
                "available_amount": { $first: "$coupondetails.available_amount" },
                "purchase_amount": { $first: "$coupondetails.purchase_amount" },
                "actual_count": { $first: "$coupondetails.actual_count" },
                "user_punch_count": { $first: "$redeemcoupons.userId" },
                "punch_count": {
                    $push: {
                        $cond: [{ $eq: ["$redeemcoupons.userId", mongoose.Types.ObjectId(userID)] }, "$redeemcoupons.punch_count", 0
                        ]
                    }
                },
                "payment": {
                    $push: {
                        $cond: [{ $eq: ["$redeemcoupons.userId", mongoose.Types.ObjectId(userID)] }, true, 0
                        ]
                    }
                },
                "purchase_amount": { $first: "$coupondetails.purchase_amount" },
                "launch_date": { $first: "$coupondetails.launch_date" },
                "available_to": { $first: "$coupondetails.available_to" },
                "redumption_code": { $first: "$coupondetails.redumption_code" },
                "address1": { $first: "$vendorprofile.address1" },
                "address2": { $first: "$vendorprofile.address2" },
                "city": { $first: "$vendorprofile.city" },
                "state": { $first: "$vendorprofile.state" },
                "zip": { $first: "$vendorprofile.zip" },
            }
        },
        {
            $project: {
                "_id": 1,
                "coupon_id": 1,
                "coupon_name": 1,
                "logo_url": 1,
                "discount_type": 1,
                "qupey_type": 1,
                "discription": 1,
                "coupon_status": 1,
                "expiration_date": 1,
                "vendorname": 1,
                "vendor_id": 1,
                "terms_condition": 1,
                "available_amount": 1,
                "purchase_amount": 1,
                "actual_count": 1,
                "user_punch_count": 1,
                "punch_count": {
                    $filter: {
                        input: "$punch_count",
                        as: "punch_count",
                        cond: { $ne: ["$$punch_count", 0] }
                    }
                },
                "payment": 1,
                "purchase_amount": 1,
                "launch_date": 1,
                "available_to": 1,
                "redumption_code": 1,
                "address1": 1,
                "address2": 1,
                "city": 1,
                "state": 1,
                "zip": 1,
            }
        }
    ], (err, couponResult) => {
        console.log(couponResult)
        if (err) {
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        } else {
            couponResult = couponResult.filter((re2) => {
                if (re2.qupey_type == "Advance Purchase Required" && re2.available_amount == 0) {
                    return false;
                }
                else {
                    return true;
                }
            })
            couponResult.map((cou) => {
                cou.payment = cou.payment[0];
                cou.punch_count = (cou.punch_count.length != 0) ? cou.punch_count[0] : 0;
                return cou;
            })
            response = {
                'data': couponResult,
                'message': req.t('SUCCESS')
            }
            res.status(200).json(response);
        }
    });
}

module.exports = walletCtr;