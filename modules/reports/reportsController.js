let fs = require('fs');
let couponModel = require('../coupon/couponModel');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let redeemModel = require('../redeem/redeemModel.js');
let userModel = require('../user/userModel.js');
let md5 = require("js-md5");
let mongoose = require('mongoose');
let reportsCtr = {};

reportsCtr.mostRedeemoday = (req,res) => {
    let vendorID = jwt.getUserId(req.headers['x-auth-token']);
    if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
        offset = ((req.params.start - 1) * process.env.MAX_RECORD);
    }
    let now = new Date();
    let startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  0, 0, 0);
    let endDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  23, 59, 59);
   
    couponModel.aggregate([
       {
           $match:{
               'vendor_id': { $eq: mongoose.Types.ObjectId(vendorID) }
           }
       } ,
       { 
           $lookup: {
            from: "redeems",
            localField: "_id",
            foreignField: "couponId",
            as: "redeemsdetail"
        }
       },
        {$unwind:"$redeemsdetail"},
       {
            $match: {$and:
                [
                   
                    {'redeemsdetail.createdAt': {$gte:startDate}},
                    {'redeemsdetail.createdAt': {$lt:endDate}} 
                ]
            }
        },
        {
                $group:{
                "_id":"$_id",
                "vendor_id" : {$first:"$vendor_id"},
                "coupon_name" : {$first:"$coupon_name"},
                "discount_type" : {$first:"$discount_type"},
                "qupey_type" : {$first:"$qupey_type"},
                "discription" : {$first:"$discription"},
                "expiration_date" :{$first:{ $dateToString: { format: "%m.%d.%Y", date: "$expiration_date" } }},
                "total_redeems": { $sum: 1 }
            }
        },
        {
            $sort: {
                "total_redeems": -1
            }
        },
        { "$limit": offset + parseInt(process.env.MAX_RECORD) },
        { "$skip": offset } 
    ], function (err, couponResults) {
        
        if(couponResults.length>0){
            response = {
                'data': couponResults,
                'message': req.t('SUCCESS')
            }
            res.status(200).json(response);
        }else{
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        }
    })
}
reportsCtr.leastRedeem = (req,res) => {
    let vendorID = jwt.getUserId(req.headers['x-auth-token']);
    console.log(vendorID);
    if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
        offset = ((req.params.start - 1) * process.env.MAX_RECORD);
    }
    couponModel.aggregate([
       {
           $match:{
               'vendor_id': { $eq: mongoose.Types.ObjectId(vendorID) }
           }
       } ,
       { 
           $lookup: {
            from: "redeems",
            localField: "_id",
            foreignField: "couponId",
            as: "redeemsdetail"
        }
       },
        {$unwind:"$redeemsdetail"},
        {
                $group:{
                "_id":"$_id",
                "vendor_id" : {$first:"$vendor_id"},
                "coupon_name" : {$first:"$coupon_name"},
                "discount_type" : {$first:"$discount_type"},
                "qupey_type" : {$first:"$qupey_type"},
                "discription" : {$first:"$discription"},
                "expiration_date" :{$first:{ $dateToString: { format: "%m.%d.%Y", date: "$expiration_date" } }},
                "total_redeems": { $sum: 1 }
            }
        },
        {
            $sort: {
                "total_redeems": 1
            }
        },
        { "$limit": offset + parseInt(process.env.MAX_RECORD) },
        { "$skip": offset } 
    ], function (err, couponResults) {
       
        if(couponResults.length>0){
            response = {
                'data': couponResults,
                'message': req.t('SUCCESS')
            }
            res.status(200).json(response);
        }else{
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        }
    })
}
reportsCtr.mostRedeemers = (req,res) =>{
    let vendorID = jwt.getUserId(req.headers['x-auth-token']);
    if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
        offset = ((req.params.start - 1) * process.env.MAX_RECORD);
    }
    userModel.aggregate([
       
       { 
           $lookup: {
            from: "redeems",
            localField: "_id",
            foreignField: "userId",
            as: "redeemsdetail"
        }
       },
        {$unwind:"$redeemsdetail"},
        {
           $match:{
               'redeemsdetail.vendorId': { $eq: mongoose.Types.ObjectId(vendorID) }
           }
       } ,
        {
                $group:{
                "_id":"$_id",
                "name" : {$first:"$name"},
                "logo": { $first: { $concat: [config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH, "$logo"] }  },
                "total_redeems": { $sum: 1 }
            }
        },
        {
            $sort: {
                "total_redeems": -1
            }
        },
        { "$limit": offset + parseInt(process.env.MAX_RECORD) },
        { "$skip": offset },
        { "$sort":{ "name": 1 }},
    ], function (err, userResults) {
        
        if(userResults.length>0){
            userResults.sort((a, b) => {
                if (a.name < b.name) {
                  return -1;
                } else if (a.name> b.name) {
                  return 1;
                } else {
                  return 0;
                }
              });
            response = {
                'data': userResults,
                'message': req.t('SUCCESS')
            }
            res.status(200).json(response);
        }else{
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        }
    })
}
reportsCtr.mostRedeemMonthly = (req,res) =>{
    let vendorID = jwt.getUserId(req.headers['x-auth-token']);
    console.log(req.body);
    if (!utils.empty(req.body.start) && !isNaN(req.body.start)) {
        offset = ((req.body.start - 1) * process.env.MAX_RECORD);
    }
    couponModel.aggregate([
       {
           $match:{
               'vendor_id': { $eq: mongoose.Types.ObjectId(vendorID) }
           }
       } ,
       { 
           $lookup: {
            from: "redeems",
            localField: "_id",
            foreignField: "couponId",
            as: "redeemsdetail"
        }
       },
        {$unwind:"$redeemsdetail"},
        {
                $group:{
                "_id":"$_id",
                "vendor_id" : {$first:"$vendor_id"},
                "coupon_name" : {$first:"$coupon_name"},
                "discount_type" : {$first:"$discount_type"},
                "qupey_type" : {$first:"$qupey_type"},
                "discription" : {$first:"$discription"},
                "expiration_date" :{$first:{ $dateToString: { format: "%m.%d.%Y", date: "$expiration_date" } }},
                "year": {$first:{$year: "$redeemsdetail.createdAt"}},
                "month": {$first:{$month: "$redeemsdetail.createdAt"}},
            }
        },
        {
            $project:{
                "vendor_id" : 1,
                "coupon_name" : 1,
                "discount_type" : 1,
                "qupey_type" : 1,
                "discription" : 1,
                "expiration_date" :1,
                "total_redeems": { $sum: 1 },
                "year":"$year",
                "month": "$month"
            }
        },
        {
            $match: {$and:[
                    {"year": parseInt(req.body.year)},
                    {"month": parseInt(req.body.month)}
                 ]
            }
        },
        {
            $sort: {
                "total_redeems": 1
            }
        },
        { "$limit": offset + parseInt(process.env.MAX_RECORD) },
        { "$skip": offset } 
    ], function (err, couponResults) {
       console.log(err,couponResults);
        if(couponResults.length>0){
            response = {
                'data': couponResults,
                'message': req.t('SUCCESS')
            }
            res.status(200).json(response);
        }else{
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        }
    })
}
module.exports = reportsCtr;