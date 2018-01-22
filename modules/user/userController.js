let fs = require('fs');
let userHelper = require('./userHelper.js');
let userModel = require('./userModel.js');
let StripeUtility = require('../../helper/stripeUtils');
let notificationUtility = require('../../helper/notificationUtils');
let vendorModel = require('../vendor/vendorModel');
let userPayment = require('../userPayment/userPayment');
let vendorHelper = require('../vendor/vendorHelper');
let paymentModel = require('../payment/paymentModel');
let couponModel = require('../coupon/couponModel');
let redeemModel = require('../redeem/redeemModel');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let awsUtils = require('../../helper/awsUtils.js');
let logsModel = require('../logs/logsModel.js');
let md5 = require("js-md5");
let AWS = require('aws-sdk');
AWS.config.accessKeyId = process.env.ACCESS_KEY_ID;
AWS.config.secretAccessKey = process.env.SECRET_ACCESS_KEY_ID;
AWS.config.region = process.env.REGION;
let sns = new AWS.SNS();

let mongoose = require('mongoose');
let userCtr = {};
userCtr.loginWithSocialMedia = (req, res) => {
    console.log(req.body);
    userModel.findOne({
        "social_media_id": req.body.social_media_id,
        "social_media_type": req.body.social_media_type
    }, {
            "email": 1,
            "username": 1,
            "type": 1,
            "phonenumber": 1,
            "isBlocked": 1,
            "name": 1,
            "logo": 1,
            "user_basic_information": 1,
            "newQupeyNotify": 1,
            "expQupeyNotify": 1,
            "redemptionNotify": 1,
            "newBusinessNotify": 1

        },
        function (err, userResults) {
            if (userResults) {
                if (userResults.isBlocked == false) {
                let condition = { _id: userResults._id };
                if (req.body.device_token != null) {
                    let updateValue = { device_token: req.body.device_token, device_type: req.body.device_type }
                    utils.modifyField('users', condition, updateValue, (updateErr, results) => {
                        userCtr.getUserDetail(userResults, function (result) {
                            res.status(200).json({ result });
                        });
                    })
                } else {
                    let updateValue = { device_token: null, device_type: null }
                    utils.modifyField('users', condition, updateValue, (updateErr, results) => {
                        userCtr.getUserDetail(userResults, function (result) {
                            res.status(200).json({ result });
                        });
                    });
                }
            } else {
                res.status(400).json(req.body.username + req.t("USER_BLOCK"));
            }

            } else {
                res.status(400).json(req.t("NOT_VALID_CREDENTIALA"));
            }
        });
}
userCtr.login = (req, res) => {
    console.log(req.body);
    userModel.findOne({
        "$or": [{ 'email': req.body.username.toLowerCase() }, { 'username': req.body.username.toLowerCase() }, { 'phonenumber': req.body.username }],
        "password": utils.encrypt(req.body.password),
        "type": req.body.type
    }, {
            "email": 1,
            "username": 1,
            "type": 1,
            "phonenumber": 1,
            "verified": 1,
            "isBlocked": 1,
            "isSubscribe": 1,
            "user_basic_information": 1,
            "name": 1,
            "expiryDate": 1,
            "logo": 1,
            "background_image": 1,
            "newQupeyNotify": 1,
            "expQupeyNotify": 1,
            "redemptionNotify": 1,
            "newBusinessNotify": 1
        },
        function (err, userResults) {
            if (userResults) {
                if (userResults.type == "vendor") {
                    if (userResults.verified == true && userResults.isBlocked == false) {
                        let updateValue = { device_token: req.body.device_token, device_type: req.body.device_type }
                        let condition = { _id: userResults._id };
                        utils.modifyField('users', condition, updateValue, (updateErr, results) => {
                            userCtr.getUserDetail(userResults, function (result) {
                                res.status(200).json({ result });
                            });
                        });
                    } else if (userResults.verified == true && userResults.isBlocked == true) {
                        res.status(400).json(req.body.username + req.t("USER_BLOCK"));
                    } else {
                        res.status(400).json(req.t("REGISTRATION_SUCCESS"));
                    }
                } else if (userResults.type == "user") {
                    if (userResults.isBlocked == false) {
                        let condition = { _id: userResults._id };
                        if (req.body.device_token != null) {
                            let updateValue = { device_token: req.body.device_token, device_type: req.body.device_type }
                            utils.modifyField('users', condition, updateValue, (updateErr, results) => {
                                userCtr.getUserDetail(userResults, function (result) {
                                    res.status(200).json({ result });
                                });
                            });
                        } else {
                            let updateValue = { device_token: null, device_type: null }
                            utils.modifyField('users', condition, updateValue, (updateErr, results) => {
                                userCtr.getUserDetail(userResults, function (result) {
                                    res.status(200).json({ result });
                                });
                            });
                        }
                    } else {
                        res.status(400).json(req.body.username + req.t("USER_BLOCK"));
                    }
                } else {
                    res.status(400).json(req.t("NOT_VALID_CREDENTIALA"));
                }


            } else {
                res.status(400).json(req.t("NOT_VALID_CREDENTIALA"));
            }
        });
}
/* This function return only userdetail and secrete token*/
userCtr.getUserDetail = (result, callback) => {
    let secreteToken = jwt.createSecretToken({ uid: result._id });
    let userData = {};

    userData._id = result._id;
    userData.name = result.name;
    userData.username = result.username;
    userData.email = result.email;
    userData.phonenumber = result.phonenumber;
    userData.type = result.type;
    userData.verified = result.verified;
    userData.isBlocked = result.isBlocked;
    userData.expiryDate = result.expiryDate;
    userData.newQupeyNotify = result.newQupeyNotify;
    userData.expQupeyNotify = result.expQupeyNotify;
    userData.redemptionNotify = result.redemptionNotify;
    userData.newBusinessNotify = result.newBusinessNotify;

    userData.isSubscribe = result.isSubscribe;
    // userData.uData.token = secreteToken

    if (result.logo) {
        console.log("----", result.logo);
        userData.logo = config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH + result.logo;
    }
    else {
        console.log("++++", result.logo);
        userData.logo = null;

    }
    if (result.background_image) {
        userData.background_image = config.AWS_URL + config.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH + result.background_image;
    }
    else {
        userData.background_image = null;
    }
    if (result.type == "user") {
        if (result.user_basic_information) {
            userData.user_basic_information = result.user_basic_information;
        }
        else {
            userData.user_basic_information = null;
        }
    }
    let response = {
        secreteToken: secreteToken,
        uData: userData
    }

    callback(response);
}
/* This function for registration pass two variable table name and  req example req ={name :'example'} */
userCtr.emailExists = (req, res) => {
    console.log(req.body);
    userHelper.emailExists(req.body.email.toLowerCase(), function (result) {
        console.log(result);
        if (!result) {
            res.status(200).json(req.t("SUCCESS"));
        } else {
            res.status(400).json(req.body.email + req.t("EXISTS"));
        }
    });
}

userCtr.userNameExists = (req, res) => {
    userModel.find({
        'username': req.body.username.toLowerCase(),
    }, {
            "username": 1,
        },
        function (err, userResults) {
            console.log(userResults);
            if (userResults.length > 0) {
                res.status(400).json(req.body.username + req.t("UNAME_EXISTS"));

            } else {
                res.status(200).json(req.body.username + req.t("ISEXISTS"));
            }
        });
}
userCtr.changePassword = (req, res) => {
    let vendorID = jwt.getUserId(req.headers['x-auth-token']);
    userModel.findOne({
        "_id": mongoose.Types.ObjectId(vendorID),
        "password": utils.encrypt(req.body.oldpassword),

    }, {
            "password": 1
        },
        function (err, userResults) {
            console.log(userResults);
            if (!userResults) {
                res.status(400).json(req.t("PASSWORD_NOTMATCH"));
            } else {
                let post = {
                    'password': utils.encrypt(req.body.newpassword)
                }
                userModel.update({ _id: mongoose.Types.ObjectId(vendorID) }, post, (err, updateSuccess) => {

                    res.status(200).json(req.t("PASSWORD_CHANGE"));
                })
            }
        });
}
userCtr.otp = (req, res) => {
    userHelper.phoneNumberExists(req.body.phonenumber, function (result) {
        console.log(result);
        if (!result) {
            console.log(process.env.PRODUCTION);
            if (process.env.PRODUCTION == "true") {
                let otp = utils.makeRandomNumber()
                let params = {
                    Message: 'Your OTP for registration in Qupey APP is ' + otp,
                    MessageStructure: 'string',
                    PhoneNumber: process.env.COUNTRYCODE + req.body.phonenumber
                };
                sns.publish(params, function (err, data) {
                    console.log(err, data);
                    if (err) {
                        res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
                    } else {
                        response = {
                            'otp': otp,
                            'message': req.t('OTP_SEND')
                        }
                        res.status(200).json(response);
                    }
                });
            } else {
                response = {
                    'otp': "1234",
                    'message': req.t('OTP_SEND')
                }
                res.status(200).json(response);
            }
        } else {
            res.status(400).json(req.body.phonenumber + req.t("PHONENUM_EXISTS"));
        }
    });
}
userCtr.userRegistration = (req, res) => {
    let post;
    console.log(req.body);
    if (!utils.isDefined(req.body.password)) {
        post = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            username: req.body.username.toLowerCase(),
            phonenumber: req.body.phonenumber,
            type: req.body.type,
            verified: false,
            social_media_id: (req.body.social_media_id != "") ? req.body.social_media_id : '',
            isBlocked: false,
            device_token: req.body.device_token,
            device_type: (req.body.device_type != "" && req.body.device_type != null) ? req.body.device_type : 'iOS',
            social_media_type: req.body.social_media_type
        }
    } else {
        post = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: utils.encrypt(req.body.password),
            username: req.body.username.toLowerCase(),
            phonenumber: req.body.phonenumber,
            type: req.body.type,
            verified: false,
            social_media_id: (req.body.social_media_id != "") ? req.body.social_media_id : '',
            isBlocked: false,
            device_token: req.body.device_token,
            device_type: (req.body.device_type != "" && req.body.device_type != null) ? req.body.device_type : 'iOS',
            social_media_type: req.body.social_media_type
        }
    }

    console.log(post);
    let user = new userModel(post);
    user.save((err) => {
        console.log(err);
        if (!utils.isDefined(err)) {
            let secretToken = jwt.createSecretToken({ uid: user._id })
            let data = {
                email: user.email,
                username: user.username,
                type: user.type,
                name: user.name,
                phonenumber: user.phonenumber,
                secretToken: secretToken,
                isBlocked: user.isBlocked,
                isSubscribe: user.isSubscribe,
                verified: user.verified,
                newQupeyNotify: user.newQupeyNotify,
                expQupeyNotify: user.expQupeyNotify,
                redemptionNotify: user.redemptionNotify,
                newBusinessNotify: user.newBusinessNotify

            }
            if (req.body.type == "vendor") {
                let vendor_post = {
                    vendor_id: mongoose.Types.ObjectId(user._id),
                }
                let vendor = new vendorModel(vendor_post);
                vendor.save();
            }

            response = {
                'data': data,
                'message': req.t('REGISTRATION_SUCCESS')
            }

            res.status(200).json(response);


        } else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
        }

    });




}
//this code is not done yet
userCtr.forgotPassword = (req, res) => {
    userModel.findOne({
        "$or": [{ 'email': req.body.email.toLowerCase() }, { 'username': req.body.email.toLowerCase() }, { 'phonenumber': req.body.email }]
    }, (err, user) => {
        if (user) {
            userHelper.sendForgotEmail(user.email, user.name, utils.decrypt(user.password), function (err, passResult) {
                res.status(200).json(req.t("SENDMAIL"));
            });
        } else {
            res.status(400).json(req.body.email + req.t("NOTEXISTS"));
        }
    });
}
userCtr.getUserPlanMiddleware = (req, res) => {
    let userID = jwt.getUserId(req.headers['x-auth-token']);
    paymentModel.find({
        "vendor_id": mongoose.Types.ObjectId(userID),
    }, {
            "subscriptionPlan": 1
        }).sort({ _id: -1 }).limit(1).exec((err, userResults) => {
            console.log(userResults);
            if (userResults) {
                let plan = JSON.parse(config.STRIPE_PLAN);
                let picked = _.filter(plan, { 'plan': userResults[0].subscriptionPlan });
                let planwithoutCurrentPlan = _.remove(plan, { 'plan': userResults[0].subscriptionPlan });
                response = {
                    'cureentPlan': picked[0],
                    'plans': plan,
                    'message': req.t('SUCCESS')
                }
                res.status(200).json(response);
            } else {
                res.status(400).json(req.t("NO_RECORD_FOUND"));
            }
        });
}
userCtr.userProfile = (req, res) => {
    let userID = jwt.getUserId(req.headers['x-auth-token']);
    userModel.findOne({
        "_id": mongoose.Types.ObjectId(userID),
    }, {
            "user_basic_information": 1,
            "_id": 1,
            "logo": 1,
            "name": 1,
            "email": 1,
            "username": 1,
            "phonenumber": 1,
        },
        function (err, userResults) {
            console.log(userResults);
            if (userResults) {
                if (userResults.logo) {
                    logo = config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH + userResults.logo;
                }
                else {
                    logo = null;

                }
                let response = {
                    user_basic_information: userResults.user_basic_information,
                    _id: userResults._id,
                    logo: logo,
                    name: userResults.name,
                    email: userResults.email,
                    username: userResults.username,
                    phonenumber: userResults.phonenumber,
                }
                console.log(response);
                response = {
                    'data': response,
                    'message': req.t('SUCCESS')
                }
                res.status(200).json(response);
            } else {
                res.status(400).json(req.t("NO_RECORD_FOUND"));
            }
        });
}
userCtr.vendorProfile = (req, res) => {
    let vendorID = jwt.getUserId(req.headers['x-auth-token']);
    userModel.aggregate([
        {
            $lookup: {
                from: "vendorprofiles",
                localField: "_id",
                foreignField: "vendor_id",
                as: "vendor_profile"
            }
        },
        {
            $unwind:
            {
                path: '$vendor_profile',
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $match: {
                'vendor_profile.vendor_id': { $eq: mongoose.Types.ObjectId(vendorID) },
            }
        },
        {
            $group: {
                '_id': '$_id',
                'email': { $first: '$email' },
                'username': { $first: '$username' },
                'name': { $first: '$name' },
                'phonenumber': { $first: '$phonenumber' },

                'type': { $first: '$type' },
                "vendor_id": { $first: '$vendor_profile.vendor_id' },
                "profile_discrption": { $first: '$vendor_profile.profile_discrption' },
                "businessPhone": { $first: '$vendor_profile.businessPhone' },
                "address1": { $first: '$vendor_profile.address1' },
                "address2": { $first: '$vendor_profile.address2' },
                "city": { $first: '$vendor_profile.city' },
                "state": { $first: '$vendor_profile.state' },
                "zip": { $first: '$vendor_profile.zip' },
                "note": { $first: '$vendor_profile.note' },
                "weekhours": { $first: '$vendor_profile.weekhours' },
                "website": { $first: '$vendor_profile.website' },
                "twitter": { $first: '$vendor_profile.twitter' },
                "facebook": { $first: '$vendor_profile.facebook' },
                "instagram": { $first: '$vendor_profile.instagram' },
                "location": { $first: '$vendor_profile.location' }
            }
        },
        {
            $project: {
                '_id': 1,
                'email': 1,
                'username': 1,
                'phonenumber': 1,
                'businessPhone': 1,
                'type': 1,
                'name': 1,
                "vendor_id": '$vendor_id',
                "profile_discrption": '$profile_discrption',
                "address1": '$address1',
                "address2": '$address2',
                "city": '$city',
                "state": '$state',
                "zip": '$zip',
                "note": '$note',
                "weekhours": '$weekhours',
                "website": '$website',
                "twitter": '$twitter',
                "facebook": '$facebook',
                "location": '$location',
                "instagram": '$instagram'
            }
        }


    ], function (err, vendorResults) {
        if (vendorResults.length > 0) {
            response = {
                'data': vendorResults[0],
                'message': req.t('SUCCESS')
            }
            res.status(200).json(response);
        } else {
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        }
    })
}

userCtr.updateUserProfile = (req, res) => {
    console.log(req.body.prfileImage);
    console.log(req.body.data);
    let post = {
        'username': req.body.username.toLowerCase(),
        'email': req.body.email.toLowerCase(),
        'phonenumber': req.body.phonenumber,
        'name': req.body.name,
        'user_basic_information': req.body.user_basic_information
    }
    let userId = jwt.getUserId(req.headers['x-auth-token']);
    userModel.update({ _id: mongoose.Types.ObjectId(userId) }, post, (err, updateSuccess) => {
        console.log(err, updateSuccess);
        if (!err) {
            return res.status(200).json(req.t('PROFILE_UPDATED'))
        } else {
            return res.status(400).json(req.t('PLEASE_TRY_AGAIN'))
        }
    })
}
userCtr.updateVendorProfile = (req, res) => {
    console.log(req.body.prfileImage);
    console.log(req.body.data);
    let post = {
        'username': req.body.username.toLowerCase(),
        'email': req.body.email.toLowerCase(),
        'phonenumber': req.body.phonenumber,
        'name': req.body.name
    }
    let vendor_post = {
        profile_discrption: (req.body.profile_discrption != "") ? req.body.profile_discrption : "",
        address1: req.body.address1,
        address2: (req.body.address2 != "") ? req.body.address2 : "",
        city: req.body.city,
        businessPhone: (req.body.businessPhone != "") ? req.body.businessPhone : "",
        state: req.body.state,
        zip: req.body.zip,
        note: req.body.note,
        weekhours: (req.body.weekhours != "") ? req.body.weekhours : "",
        website: (req.body.website != "") ? req.body.website : "",
        facebook: (req.body.facebook != "") ? req.body.facebook : "",
        twitter: (req.body.twitter != "") ? req.body.twitter : "",
        instagram: (req.body.instagram != "") ? req.body.instagram : "",
        location: [req.body.longitude, req.body.latitude],
    }
    console.log(vendor_post);
    let userId = jwt.getUserId(req.headers['x-auth-token']);
    console.log(post);
    console.log(userId);
    userModel.update({ _id: mongoose.Types.ObjectId(userId) }, post, (err, updateSuccess) => {
        console.log(err, updateSuccess);
        if (!err) {
            vendorModel.update({ vendor_id: userId }, vendor_post, (errVendor, updatevendorSuccess) => {
                console.log(errVendor, updatevendorSuccess);
                if (!errVendor) {
                    return res.status(200).json(req.t('PROFILE_UPDATED'))
                } else {
                    return res.status(400).json(req.t('PLEASE_TRY_AGAIN'))
                }
            });
        } else {
            return res.status(400).json(req.t('PLEASE_TRY_AGAIN'))
        }
    })
}
userCtr.getVendor = (req, res) => {
    let userId = jwt.getCurrentUserId(req);
    userModel.aggregate([
        {
            $match:
            {
                "_id": mongoose.Types.ObjectId(req.params.id)
            }
        },
        {
            $lookup: {
                from: "vendorprofiles",
                localField: "_id",
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
                from: "followers",
                localField: "_id",
                foreignField: "vendorId",
                as: "vendorfollower"
            }
        },
        {
            $unwind: {
                path: '$vendorfollower'
            }
        },
        {
            $lookup: {
                from: "coupons",
                localField: "_id",
                foreignField: "vendor_id",
                as: "vendorcoupons"
            }
        },
        {
            $unwind: {
                path: '$vendorcoupons'
            }
        },
        {
            $match: {
                $and:
                [
                    { "vendorfollower.userId": mongoose.Types.ObjectId(userId) },
                    { "vendorfollower.vendorId": mongoose.Types.ObjectId(req.params.id) }
                ]
            }
        },
        {
            $group: {
                "_id": "$_id",
                "vendorname": { $first: "$name" },
                "location": { $first: "$vendorprofile.location" },
                "note": { $first: "$vendorprofile.note" },
                "phone": { $first: "$vendorprofile.phone" },
                "businessPhone": { $first: "$vendorprofile.businessPhone" },
                "zip": { $first: "$vendorprofile.zip" },
                "state": { $first: "$vendorprofile.state" },
                "city": { $first: "$vendorprofile.city" },
                "address1": { $first: "$vendorprofile.address1" },
                "address2": { $first: "$vendorprofile.address2" },
                "logo_url": { $first: config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH + "$vendorprofile.logo" },
                "video_url": { $first: "$vendorprofile.video" },
                "banner_url": { $first: config.AWS_URL + config.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH + "$vendorprofile.background_image" },
                "status": { $first: "$vendorfollower.status" },
                "like": { $first: "$vendorfollower.like" },
                "couponname": { $first: "$vendorcoupons.coupon_name" },
                "qupeytype": { $first: "$vendorcoupons.qupey_type" },
                "availableamount": { $first: "$vendorcoupons.available_amount" },
                "purchaseamount": { $first: "$vendorcoupons.purchase_amount" },
                "expirationdate": { $first: "$vendorcoupons.expiration_date" },
                "termscondition": { $first: "$vendorcoupons.terms_condition" },
                "redumptioncode": { $first: "$vendorcoupons.redumption_code" },
            }
        },
    ], (err, vendorDetails) => {
        if (err) {
            console.log(err);
            res.status(400).json(req.t("NO_RECORD_FOUND"));
        }
        else {
            let response = {
                "data": vendorDetails,
                "message": req.t('SUCCESS')
            }
            res.status(200).json(response);
        }
    })
}
userCtr.getNearByVendor = (req, res) => {
    let userLongitude = parseFloat(req.body.longitude);
    let userLatitude = parseFloat(req.body.latitude);
    let offset = 0;
    let userId = jwt.getCurrentUserId(req);
    if (!utils.empty(req.body.start) && !isNaN(req.body.start)) {
        offset = ((req.body.start - 1) * parseInt(process.env.MAX_RECORD));
    }
    let now = new Date();
    let date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0);
    vendorModel.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [userLongitude, userLatitude] },
                distanceField: "dist.calculated",
                includeLocs: "dist.location",
                spherical: true,
                distanceMultiplier: 0.000621371,

            }
        },

        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "vendornames"
            }
        },

        {
            $unwind: {
                path: '$vendornames'
            }
        },
        {
            $lookup: {
                from: "coupons",
                localField: "vendor_id",
                foreignField: "vendor_id",
                as: "coupondetails"
            }
        },
        {
            $unwind: {
                path: '$coupondetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "followers",
                localField: "vendor_id",
                foreignField: "vendorId",
                as: "vendorfollower"
            }
        },
        {
            $match: {
                "vendornames.isBlocked": { $eq: false }
            },
        },
        {
            $group: {
                "_id": "$_id",
                "vendor_id": { $first: "$vendor_id" },
                "vendorname": { $first: "$vendornames.name" },//make change to other api
                "profile_discrption": { $first: "$profile_discrption" },
                "businessPhone": { $first: "$businessPhone" },
                "note": { $first: "$note" },
                "weekhours": { $first: "$weekhours" },
                "phone": { $first: "$vendornames.phonenumber" },
                "zip": { $first: "$zip" },
                "isBlocked": { $first: "$vendornames.isBlocked" },
                "state": { $first: "$state" },
                "city": { $first: "$city" },
                "address1": { $first: "$address1" },
                "address2": { $first: "$address2" },
                "email": { $first: "$vendornames.email" },
                "logo_url": { $first: { $concat: [config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH, "$vendornames.logo"] } },
                "video_url": { $first: "$video_url" },
                "banner_url": { $first: { $concat: [config.AWS_URL + config.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH, "$vendornames.background_image"] } },
                "distance": { $first: "$dist" },
                "coupondetails": {
                    $push: {
                        $cond: [{
                            $and: [
                                { $eq: ["$coupondetails.coupon_status", 'publish'] },
                                { $gte: ["$coupondetails.expiration_date", new Date(date)] }
                            ]
                        }, 1, 0]
                    }
                },
                "isExpandable": { $first: true },
                "vendorfollower": {
                    $first: "$vendorfollower"
                }
            }
        },
        {
            $unwind: {
                path: '$vendorfollower',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                "_id": "$_id",
                "vendor_id": { $first: "$vendor_id" },
                "vendorname": { $first: "$vendorname" },//make change to other api
                "profile_discrption": { $first: "$profile_discrption" },
                "note": { $first: "$note" },
                "weekhours": { $first: "$weekhours" },
                "businessPhone": { $first: "$businessPhone" },
                "phone": { $first: "$phone" },
                "zip": { $first: "$zip" },
                "isBlocked": { $first: "$isBlocked" },
                "state": { $first: "$state" },
                "city": { $first: "$city" },
                "address1": { $first: "$address1" },
                "address2": { $first: "$address2" },
                "logo_url": { $first: "$logo_url" },
                "video_url": { $first: "$video_url" },
                "banner_url": { $first: "$banner_url" },
                "distance": { $first: "$distance" },
                "email": { $first: "$email" },
                "coupondetails": { $first: "$coupondetails" },
                "couponcount": { $first: 0 },
                "isExpandable": { $first: "$isExpandable" },
                "like": {
                    $push: {
                        $cond: [{ $eq: ["$vendorfollower.userId", mongoose.Types.ObjectId(userId)] }, "$vendorfollower.like", 0
                        ]
                    }
                },
                "status": {
                    $push: {
                        $cond: [{ $eq: ["$vendorfollower.userId", mongoose.Types.ObjectId(userId)] }, "$vendorfollower.status", 0
                        ]
                    }
                }

            }

        },
        {
            $project: {
                "_id": 1,
                "vendor_id": 1,
                "vendorname": 1,
                "profile_discrption": 1,
                "businessPhone": 1,
                "note": 1,
                "weekhours": 1,
                "phone": 1,
                "zip": 1,
                "isBlocked": 1,
                "state": 1,
                "city": 1,
                "address1": 1,
                "address2": 1,
                "logo_url": 1,
                "video_url": 1,
                "banner_url": 1,
                "distance": 1,
                "email": 1,
                "couponcount": 1,
                "isExpandable": 1,
                "status": {
                    $filter: {
                        input: "$status",
                        as: "status",
                        cond: { $ne: ["$$status", 0] }
                    }
                },
                "like": {
                    $filter: {
                        input: "$like",
                        as: "like",
                        cond: { $ne: ["$$like", 0] }
                    }
                },
            }
        },
        { "$sort": { "distance": 1 } },
        { "$limit": offset + parseInt(process.env.MAX_RECORD) },
        { "$skip": offset }
    ], (err, vendors) => {
        if (err || !vendors.length > 0) {
            console.log(err);
            res.status(400).json(req.t("NO_RECORD_FOUND"))
        }
        else {
            // vendors = _.sortBy(vendors, [function (o) { return o.distance.calculated; }]);
            vendors = _.reverse(vendors)
            vendors = vendors.map((v) => {
                v.status = v.status[0];
                v.like = v.like[0];
                return v
            })
            console.log(vendors);
            res.status(200).json({ vendors, "message": req.t("SUCCESS") });
        }
    })
}
userCtr.stripePlan = (req, res) => {
    let plan = JSON.parse(config.STRIPE_PLAN);

    response = {
        'plan': plan,
        'message': req.t('SUCCESS')
    }
    res.status(200).json(response);
}
userCtr.setProfileImage = (req, res) => {
    console.log("req.file");
    console.log(req.files);
    console.log(req.body);
    let userId = jwt.getUserId(req.headers['x-auth-token']);

    userModel.findOne({ _id: mongoose.Types.ObjectId(userId) }, function (err, result) {
        console.log(result);
        if (req.body.imageType == "profile") {
            if (!utils.isDefined(result.logo)) {
                console.log("hello");
                awsUtils.uploadLogoImage(req.files.file, userId, (savedFile) => {
                    console.log(savedFile);

                    let post = {
                        'logo': savedFile.thumb
                    }
                    userModel.update({ _id: mongoose.Types.ObjectId(userId) }, post, (err, updateSuccess) => {

                        let response = {
                            originalImage: config.AWS_URL + config.DEFAULT_IMAGE_PATH + savedFile.originalImage,
                            thumb: config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH + savedFile.thumb
                        }
                        res.status(200).json(response);
                    })
                });
            } else {
                //   console.log(result.logo);
                //   console.log("hello1");
                awsUtils.deleteFile(result.logo, config.DEFAULT_IMAGE_PATH);
                awsUtils.deleteFile(result.logo, config.DEFAULT_THUMB_IMAGE_PATH);
                awsUtils.uploadLogoImage(req.files.file, userId, (savedFile) => {
                    console.log(savedFile);

                    let post = {
                        'logo': savedFile.thumb
                    }
                    userModel.update({ _id: mongoose.Types.ObjectId(userId) }, post, (err, updateSuccess) => {

                        let response = {
                            originalImage: config.AWS_URL + config.DEFAULT_IMAGE_PATH + savedFile.originalImage,
                            thumb: config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH + savedFile.thumb
                        }
                        res.status(200).json(response);
                    })
                });
            }

        } else if (req.body.imageType == "back") {
            if (!utils.isDefined(result.background_image)) {
                awsUtils.uploadBannerImage(req.files.file, userId, (savedFile) => {
                    let post = {
                        'background_image': savedFile.thumb
                    }
                    userModel.update({ _id: mongoose.Types.ObjectId(userId) }, post, (err, updateSuccess) => {
                        let response = {
                            originalImage: config.AWS_URL + config.DEFAULT_BACKGROUND_IMAGE_PATH + savedFile.originalImage,
                            thumb: config.AWS_URL + config.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH + savedFile.thumb
                        }
                        res.status(200).json(response);
                    })
                });
            } else {
                awsUtils.deleteFile(result.background_image, config.DEFAULT_BACKGROUND_IMAGE_PATH);
                awsUtils.deleteFile(result.background_image, config.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH);
                awsUtils.uploadBannerImage(req.files.file, userId, (savedFile) => {
                    let post = {
                        'background_image': savedFile.thumb
                    }
                    userModel.update({ _id: mongoose.Types.ObjectId(userId) }, post, (err, updateSuccess) => {
                        let response = {
                            originalImage: config.AWS_URL + config.DEFAULT_BACKGROUND_IMAGE_PATH + savedFile.originalImage,
                            thumb: config.AWS_URL + config.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH + savedFile.thumb
                        }
                        res.status(200).json(response);
                    })
                });
            }
        }
    })

}
userCtr.saveSetting = (req, res) => {
    let userId = jwt.getUserId(req.headers['x-auth-token']);
    utils.modifyField('users', { _id: mongoose.Types.ObjectId(userId) }, req.body, (updateErr, results) => {
        console.log("settings update to null", results);
        res.status(200).json(req.t('SUCCESS'));
    });

}
userCtr.logout = (req, res) => {
    let userId = jwt.getUserId(req.headers['x-auth-token']);
    let condition = { _id: mongoose.Types.ObjectId(userId) };
    utils.modifyField('users', condition, { "device_token": null }, (updateErr, results) => {
        console.log("settings update to null", results);
        res.status(200).json(req.t('SUCCESS'));
    });

}
userCtr.getNumbers = (req, res) => {
    let userId = jwt.getUserId(req.headers['x-auth-token']);

    userModel.aggregate([
        {
            $match:
            {
                "_id": mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "wallets",
                localField: "_id",
                foreignField: "user_id",
                as: "saveCoupon"
            }
        },

        {
            $unwind: {
                path: '$saveCoupon',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "coupons",
                localField: "saveCoupon.coupon_id",
                foreignField: "_id",
                as: "coupons"
            }
        },

        {
            $unwind: {
                path: '$coupons',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $match: {
                "coupons.expiration_date": {
                    $gt: new Date()
                }
            }
        },
        {
            $group: {
                "_id": "$_id",
                "savedCouponCount": { $push: "$saveCoupon" },
                "points": { $first: "$points" }
            }
        },

        {
            $lookup: {
                from: "followers",
                localField: "_id",
                foreignField: "userId",
                as: "userfollower"
            }
        },
        {
            $unwind: {
                path: '$userfollower',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                "_id": "$_id",
                "savedCouponCount": { $first: "$savedCouponCount" },
                "followerCount": {
                    $push: {
                        $cond: [{ $eq: ["$userfollower.status", 'Follow'] },
                            1, 0]
                    }
                },
                "points": { $first: "$points" }
            },
        },
        {
            $lookup: {
                from: "redeems",
                localField: "_id",
                foreignField: "userId",
                as: "redeemCoupon"
            }
        },

        {
            $unwind: {
                path: '$redeemCoupon',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                "_id": "$_id",
                "savedCouponCount": { $first: "$savedCouponCount" },
                "redeemCoupon": {
                    $push: {
                        $cond: [{ $eq: ["$redeemCoupon.used", true] },
                            1, 0]
                    }
                },
                "followerCount": { $first: "$followerCount" },
                "points": { $first: "$points" }
            }
        },
        {
            $project: {
                "_id": 1,
                "savedCouponCount": 1,
                "points": 1,
                "redeemCoupon": { $sum: "$redeemCoupon" },
                "followerCount": { $sum: "$followerCount" }
            }
        }

    ], (err, response) => {
        if (!err) {
            console.log("numbers---", response);
            let newres = {
                "savedCouponCount": [],
                "redeemCoupon": 0,
                "followerCount": 0,
                "points": 0
            }
            if (response.length == 0) {
                res.status(200).json(newres)
            }
            else {

                //response[0].points = response[0].points + (response[0].redeemCoupon * 5);
                response = response[0];
                if (response.points == null || response.points == undefined) {
                    response.points = 0;
                }
                res.status(200).json(response);

            }
        }
        else {
            console.log(err);
            res.status(400).json(err)
        }

    })


}

userCtr.getNearByVendorCouponCount = (req, res) => {
    let userLongitude = parseFloat(req.body.longitude);
    let userLatitude = parseFloat(req.body.latitude);
    let offset = 0;
    let userId = jwt.getCurrentUserId(req);
    if (!utils.empty(req.body.start) && !isNaN(req.body.start)) {
        offset = ((req.body.start - 1) * parseInt(process.env.MAX_RECORD));
    }
    let now = new Date();
    let date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0);
    vendorModel.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [userLongitude, userLatitude] },
                distanceField: "dist.calculated",
                includeLocs: "dist.location",
                spherical: true,
                distanceMultiplier: 0.000621371,

            }
        },

        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "vendornames"
            }
        },

        {
            $unwind: {
                path: '$vendornames'
            }
        },
        {
            $match: {
                "vendornames.isBlocked": { $eq: false }
            },
        },
        {
            $lookup: {
                from: "coupons",
                localField: "vendor_id",
                foreignField: "vendor_id",
                as: "coupondetails"
            }
        },
        {
            $unwind: {
                path: '$coupondetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $match: {
                $and: [{ "coupondetails.coupon_status": { $eq: 'publish' } },
                { "coupondetails.expiration_date": { $gte: new Date(date) } },
                {
                    $or: [
                        { "coupondetails.available_to": { $elemMatch: { $eq: 'All Followers' } } }
                        , { "coupondetails.available_to": { $elemMatch: { "userId": { $eq: userId } } } }
                    ]
                }
                ]


            },
        },

        {
            $lookup: {
                from: "redeems",
                localField: "coupondetails._id",
                foreignField: "couponId",
                as: "redeemCoupon"
            },
        },




        {
            $group: {
                "_id": "$vendor_id",
                "couponList": { $push: "$coupondetails" },
                "redeemCoupon": { $push: "$redeemCoupon" }
            }
        },
        { "$limit": offset + parseInt(process.env.MAX_RECORD) },
        { "$skip": offset }
    ], (err, vendors) => {
        if (err || !vendors.length > 0) {
            console.log(err);
            res.status(400).json(req.t("NO_RECORD_FOUND"))
        }
        else {
            //vendors = _.reverse(vendors);
            vendors.map((vendor) => {
                let finalCouponList = []
                let otherCoupons = []
                vendor.couponList.map((coupon) => {
                    vendor.redeemCoupon.map((redeemed) => {

                        redeemed.map((red) => {
                            if (coupon._id.toString() == red.couponId.toString()) {
                                if (red.userId.toString() == userId.toString()) {
                                    if (red.used) {
                                        finalCouponList.push(coupon._id);
                                    }
                                }
                            }
                            return red;
                        })
                        return redeemed
                    })
                    return coupon;
                })
                vendor.couponList = vendor.couponList.filter((cou) => finalCouponList.indexOf(cou._id) < 0);
                vendor.couponList = vendor.couponList.filter((re2) => {
                    if (re2.qupey_type == "Advance Purchase Required" && re2.available_amount == 0) {
                        return false;
                    }
                    else {
                        return true;
                    }
                })
                vendor.couponCount = vendor.couponList.length;

                delete vendor.couponList;
                delete vendor.redeemCoupon;
                return vendor;
            })
            res.status(200).json({ vendors, "message": req.t("SUCCESS") });
        }
    })
}
userCtr.chargeCreate = (req, res) => {
    let userId = jwt.getUserId(req.headers["x-auth-token"]);
    console.log(userId);
    let stripeToken = req.body.token;
    let amount = req.body.amount;
    let meta = {
        "user_id": userId,
        "coupon_id": req.body.coupon_id,
        "vendor_id": req.body.vendor_id,
        "amount": "$ " + (amount / 100),
        "vendor_name": req.body.vendor_name,
        "coupon_name": req.body.coupon_name,
        "user_name": req.body.user_name,
        "vendor_email": req.body.vendor_email,
        "user_email": req.body.user_email,
    };
    console.log(amount);
    let description = req.body.user_email + " paid " + amount + " for " + req.body.coupon_name + " to " + req.body.vendor_email;
    StripeUtility.createCharge(amount, stripeToken, description, meta).then(function (payment) {

        let fields = {
            logsString: payment,
            type: "charges.create",
            module: "Payment"
        }
        console.log(fields);
        let logs = new logsModel(fields);
        logs.save((err1) => {
            if (!err1) {
                let paymentDetails = {
                    vendor_id: payment.metadata.vendor_id,
                    amount: amount,
                    currency: payment.currency,
                    paymentId: payment.id,
                    user_id: payment.metadata.user_id,
                    coupon_id: payment.metadata.coupon_id
                }
                let paymentSave = new userPayment(paymentDetails);
                paymentSave.save((err2) => {
                    console.log("User Subscription Payment done ---> ",err2);
                    if (!err2) {
                        let couponRedeemPost = {
                            vendorId: req.body.vendor_id,
                            couponId: req.body.coupon_id,
                            userId: jwt.getUserId(req.headers['x-auth-token']),
                            used: false,
                            punch_count: 0
                        }
                        let condition = {
                            vendorId: req.body.vendor_id,
                            couponId: req.body.coupon_id,
                            userId: jwt.getUserId(req.headers['x-auth-token']),
                        }
                        redeemModel.findOneAndUpdate(condition, couponRedeemPost, { upsert: true, new: true, setDefaultsOnInsert: true }, (err3, result2) => {
                            if (!err3) {
                                couponModel.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(req.body.coupon_id) }, { "available_amount": req.body.available_amount }, { upsert: true, new: true, setDefaultsOnInsert: true }, (err4, result3) => {
                                    if (!err4) {
                                        res.status(200).json(req.t("COUPON_PAYMENT_SUCCESS"));
                                    } else {
                                        console.log(err4);
                                        res.status(400).json(req.t("COUPON_PAYMENT_FAIL"));
                                    }
                                })

                            } else {
                                console.log(err3);
                                res.status(400).json(req.t("COUPON_PAYMENT_FAIL"));
                            }
                        })
                    } else {
                        console.log(err2);
                        res.status(400).json(req.t("COUPON_PAYMENT_FAIL"));
                    }
                })
            } else {
                console.log(err1);
                res.status(400).json(req.t("COUPON_PAYMENT_FAIL"));
            }
        })


    }, function (err) {
        console.log(err.message);
        res.status(400).json(req.t("COUPON_PAYMENT_FAIL"));
    });
}
userCtr.deleteUser = (req, res) => {
    //console.log("delete user",req.params.id);
    let userId=req.params.id;
    userHelper.deleteUser(userId, (err, result) => {
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
userCtr.saveVideoURL = (req, res) => {
    let userId = req.body.id;
    utils.modifyField('vendorprofiles', { vendor_id: mongoose.Types.ObjectId(userId) }, {"video_url":req.body.video_url}, (updateErr, results) => {
        //console.log("video_url update ", results);
        res.status(200).json(req.t('SUCCESS'));
    });

}
userCtr.getVideoURL = (req, res) => {
    let userId = req.params.id;
    vendorModel.findOne({ vendor_id: mongoose.Types.ObjectId(userId) }, (err, results) => {
        //console.log("video_url update ", results);
        res.status(200).json({"video_url":results.video_url});
    });

}
module.exports = userCtr;
