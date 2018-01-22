let followerModel = require('./followerModel.js');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let mongoose = require('mongoose');
let followerCtr = {};

followerCtr.updateFollowStatus = (req, res) => {
    let userId = jwt.getCurrentUserId(req);
    let post = {};
    if (req.body.status) {
        post = {
            "status": req.body.status !== '' ? req.body.status : "Unfollow"
        }
    }
    else {
        post = {
            "like": req.body.like !== '' ? req.body.like : "false"
        }
    }
    let newFollower = new followerModel(post);
    followerModel.findOneAndUpdate({ "$and": [{ "vendorId": mongoose.Types.ObjectId(req.body.vendorId) }, { "userId": mongoose.Types.ObjectId(userId) }] }, post, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, follower) => {
        if (err) {
            console.log("error at followerModel", err);
            res.status(400).json(req.t('PLEASE_TRY_AGAIN'));
        }
        else {
            if (req.body.status) {
                if (req.body.status == "Follow") {
                    res.status(200).json(req.t("FOLLOWER_ADDED"));
                } else {
                    res.status(200).json(req.t("FOLLOWER_REMOVED"));
                }
            }
            else {
                console.log("req.body.like",req.body.like);
                if (req.body.like==true) {
                    res.status(200).json(req.t("FAV_ADDED"));
                } else {
                    res.status(200).json(req.t("FAV_REMOVED"));
                }

            }

        }
    });
}
followerCtr.getFollowers = (req, res) => {
    let vendorId = jwt.getCurrentUserId(req);
    let offset = 0;
    if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
        offset = ((req.params.start - 1) * parseInt(process.env.MAX_RECORD));
    }
    followerModel.aggregate([
        {
            $match:
            {
                $and: [{ "vendorId": mongoose.Types.ObjectId(vendorId) }, { "status": 'Follow' }]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userdetail"
            }
        },
        {
            $unwind: {
                path: '$userdetail'
            }
        },
        {
            $group: {
                "_id": "$_id",
                "name": { $first: "$userdetail.name" },
                "logo": { $first: { $concat: [config.AWS_URL + config.DEFAULT_THUMB_IMAGE_PATH, "$userdetail.logo"] }  },
                "userId": { $first: "$userId" },
                "vendorId": { $first: "$vendorId" }

            }
        },
        { $limit: offset + parseInt(process.env.MAX_RECORD) },
        { $skip: offset },
        { "$sort":{ "userdetail.name": 1 }},
    ],
        (err, followers) => {
            console.log(err, followers)
            if (err || !followers.length > 0) {
                res.status(400).json(req.t("NO_RECORD_FOUND"));
            }
            else {
                followers.sort((a, b) => {
                    if (a.name < b.name) {
                      return -1;
                    } else if (a.name> b.name) {
                      return 1;
                    } else {
                      return 0;
                    }
                  });
                response = {
                    'data': followers,
                    'message': "Followers Fetched."
                }
                res.status(200).json(response);
            }
        })
}
module.exports = followerCtr;