let fs = require('fs');
let notificationModel = require('./notificationModel.js');
let userModel = require('../user/userModel');
let notificationUtility = require('../../helper/notificationUtils');
let couponModel = require('../coupon/couponModel');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let md5 = require("js-md5");
let mongoose = require('mongoose');
let notificationCtr = {};
let apn = require("apn");
let FCM = require('fcm-node');


notificationCtr.getNotifications = (req, res) => {
    let userID = jwt.getUserId(req.headers['x-auth-token']);
    userModel.findOne({ "_id": mongoose.Types.ObjectId(userID) }, (err, user) => {
       

        notificationModel.find({$or:[{ "device_token": user.device_type},{ "device_token": "All"},{ "device_token": user.device_token }] }, (err2, MsgResult) => {
            //console.log( MsgResult);
            if (err2) {
                res.status(400).json(req.t("NO_RECORD_FOUND"));
            } else {

                response = {
                    'data': MsgResult,
                    'message': req.t('SUCCESS')
                }
                res.status(200).json(response);
            }
        }).sort({ createdAt: -1 });
    })

}
//Expired Qupey
notificationCtr.checkExpQupey = (req, res) => {

    let options = {
        cert: process.env.APN_PEM,
        key: process.env.APN_PEM,

    };
    let now = new Date();
    let date = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let connection = new apn.Provider(options);
    let note = new apn.Notification();
    //date.setHours(0,0,0,0);
   // console.log(new Date(date))
    couponModel.aggregate([
        {
            $match:
            {
                $and: [{
                    "expiration_date": {
                        $gte: new Date(now)
                    }
                },
                {
                    "expiration_date": {
                        $lt: new Date(date)
                    }
                }]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "vendors"
            }
        },
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
                from: "users",
                localField: "savecoupons.user_id",
                foreignField: "_id",
                as: "usersDetails"
            }
        },
        {
            $unwind: {
                path: '$usersDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                "_id": "$_id",
                "discount_type": { $first: "$discount_type" },
                "qupey_type": { $first: "$qupey_type" },
                "coupon_name": { $first: "$coupon_name" },
                "savecoupons": { $push: "$savecoupons" },
                "token": { $push: {type:"$usersDetails.device_type",token:"$usersDetails.device_token"} },
                "vendor": { $first: "$vendors" },
            }
        }
    ], (err, result) => {
        //console.log(result[0].token);
        if (result.length != 0) {
            result.forEach((coupon) => {
                if (coupon.token.length != 0) {
                    let notifyMsg = ""
                    let htmlMsg = ""
                    switch (coupon.discount_type) {
                        case "Percentage":
                            notifyMsg = "Your Qupey " + coupon.qupey_type + " Your First Purchase" + " from " + result[0].vendor[0].name + " is about to expire!";
                            htmlMsg = "<div class='des'>" + "Your Qupey " + "<span class='highlight'>" + coupon.qupey_type + " Your First Purchase" + "</span>";
                            break;
                        case "Dollar Amount":
                            notifyMsg = "Your Qupey " + coupon.coupon_name + " from " + result[0].vendor[0].name + " is about to expire!";
                            htmlMsg = "<div class='des'>" + "Your Qupey " + "<span class='highlight'>" + coupon.coupon_name + "</span>";
                            break;
                        case "Punchcard":
                            notifyMsg = "Your Qupey " + coupon.qupey_type + " from " + result[0].vendor[0].name + " is about to expire!";
                            htmlMsg = "<div class='des'>" + "Your Qupey " + "<span class='highlight'>" + coupon.qupey_type + "</span>";
                            break;
                        case "Other":
                            notifyMsg = "Your Qupey " + coupon.coupon_name + " from " + result[0].vendor[0].name + " is about to expire!";
                            htmlMsg = "<div class='des'>" + "Your Qupey " + "<span class='highlight'>" + coupon.coupon_name + "</span>";
                            break;
                        default:
                            notifyMsg = "Your Qupey " + coupon.coupon_name + " from " + result[0].vendor[0].name + " is about to expire!";
                            htmlMsg = "<div class='des'>" + "Your Qupey " + "<span class='highlight'>" + coupon.coupon_name + "</span>";
                            break;
                    }

                    notificationUtility.notifyToMany(coupon.token, notifyMsg, htmlMsg + " from <span class='highlight'>" + result[0].vendor[0].name + "</span> is about to expire!</div>");
                    // note.alert = notifyMsg;
                    // connection.send(note, coupon.token).then((response) => {
                    //     console.log("apn___", response);
                    //     response.sent.forEach((token) => {
                    //         // notificationSent(user, token);
                    //     });
                    //     response.failed.forEach((failure) => {
                    //         console.log("apn err___", failure.response)
                    //         if (failure.error) {

                    //             // A transport-level error occurred (e.g. network problem)
                    //             //   notificationError(user, failure.device, failure.error);
                    //         } else {
                    //             // `failure.status` is the HTTP status code
                    //             // `failure.response` is the JSON payload
                    //             //   notificationFailed(user, failure.device, failure.status, failure.response);
                    //         }
                    //     });
                    // });
                    // let saveAll = coupon.endPoint.map((endPoints) => {
                    //     return { "device_token": endPoints, "notifyMsg": htmlMsg + " from <span class='highlight'>" + result[0].vendor[0].name + "</span> is about to expire!</div>" }
                    // })
                    // try {
                    //     notificationModel.insertMany(saveAll)
                    // } catch (e) {
                    //     console.log(e);
                    // }
                }
            })

        }

    })


}

notificationCtr.notifyToAll = (req, res) => {
    let condition = { "device_type": req.body.device_type, "type": req.body.userType }
    if(req.body.device_type == "All" && req.body.userType == "All"){
        condition = {}
    } else {
        if(req.body.device_type == "All") {
            condition = { "type": req.body.userType }
        } else if(req.body.userType == "All") {
            condition = { "device_type": req.body.device_type }
        }
    }

    userModel.find(condition, (err, result) => {
       let newResult = result.map((user) => { return {type:user.device_type,token:user.device_token} })
       if (result.length != 0 && (req.body.device_type=='iOS' || req.body.device_type=='All')) {
            let iOSDevices = newResult.filter((dev) => dev.type == "iOS");
            let device_list = iOSDevices.map((dev) => { return dev.token });
            console.log(device_list);
            let options = {
                cert: process.env.APN_PEM,
                key: process.env.APN_PEM,
            };
            let connection = new apn.Provider(options);
            let note = new apn.Notification();
            note.expiry = Math.floor(Date.now() / 1000) + 3600;
            note.sound = "default";
            note.alert = req.body.msg;
            console.log("apn___")
            connection.send(note, device_list).then((response) => {
                console.log("apn___", response);
                response.sent.forEach((token) => {
                    // notificationSent(user, token);
                });
                response.failed.forEach((failure) => {
                    console.log("apn err___", failure.response)
                });
            });
            
        }
         if(result.length != 0 && (req.body.device_type=='Android' || req.body.device_type=='All')){
            let androidDevices = newResult.filter((dev) => dev.type == "Android")
            let device_list = androidDevices.map((dev) => { return dev.token });
            console.log(device_list);
            var serverKey = process.env.FCM_SERVERKEY; //put your server key here 
            var fcm = new FCM(serverKey);
            var message = { 
                registration_ids: device_list,
                collapse_key: '',
                notification: {
                    title: "Qupey",
                    body: req.body.msg,
                    icon: "icon",
                    sound : "default"
                },
                data: {}
            };
           
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Android PN : Something has gone wrong!");
                    console.log(err, response);
                } else {
                    console.log("Android PN : Successfully sent with response: ", response);
                }
            });
        }
        let save = {
            "device_token": req.body.device_type,
            "notifyMsg": "<div class='des'>" + req.body.msg + "</div>",
            "orginalMsg": req.body.msg,
            "createdAt" : new Date()
        }
        let notify = new notificationModel(save);
        notify.save(err => {
            if (!utils.isDefined(err)) {

                res.status(200).json(notify);
            } else {
                res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
            }
        })
    })

}

notificationCtr.getNotificationsServer = (req, res) => {
    let offset = 0;
    let totalCoupons = 0;
    let maxRecord = parseInt(process.env.MAX_RECORD);
    let userID = jwt.getUserId(req.headers['x-auth-token']);
    console.log(req.params.start);
    if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
        offset = ((req.params.start - 1) * process.env.MAX_RECORD);
        console.log(offset);
    }
    notificationModel.aggregate([
        {
            $match:
            {
                "device_token": { $in: ["iOS", "All", "Android"] }
            }
        },
        { "$sort": { "createdAt": -1 } },
        { "$limit": offset + parseInt(process.env.MAX_RECORD) },
        { "$skip": offset },

    ]
        , (err2, MsgResult) => {
            //console.log(err2, MsgResult);
            if (err2) {
                res.status(400).json(req.t("NO_RECORD_FOUND"));
            } else {
                notificationModel.count({ "device_token": { $in: ["iOS", "All", "Android"] } }, (errCount, count) => {
                    console.log(count)
                    response = {
                        'data': MsgResult,
                        'totalMsg': count,
                        'message': req.t('SUCCESS')
                    }
                    res.status(200).json(response);
                });

            }
        })


}

module.exports = notificationCtr;