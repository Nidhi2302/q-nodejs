let md5 = require("js-md5");
let mongoose = require("mongoose");

let jwt = require("../../helper/jwt.js");
let utils = require("../../helper/utils.js");

let admin = require("./adminModel.js");
let userModel = require("../user/userModel.js");
let couponModel = require("../coupon/couponModel.js");
let Async = require('async');
let paymentModel = require("../userPayment/userPayment.js");
let redeemsModel = require("../redeem/redeemModel.js");

let adminCtr = {};

adminCtr.login = (req, res) => {
  admin.findOne(
    { $and: [{ email: req.body.email }, { password: md5(req.body.password) }] },
    function (err, adminResult) {
      if (adminResult) {
        adminCtr.getAdminDetail(adminResult, function (resObj) {
          res.status(200).json(resObj);
        });
      } else {
        res.json({ error: "NO_RECORD_FOUND" });
      }
    }
  );
};

/* This function return only userdetail and secrete token*/
adminCtr.getAdminDetail = (result, callback) => {
  let secretToken = jwt.createSecretToken({ uid: result._id });
  let adminData = {};
  adminData.id = result._id;
  adminData.email = result.email;
  adminData.token = secretToken;
  let response = {
    secret_token: secretToken,
    aData: adminData
  };
  callback(response);
};
adminCtr.getUsers = (req, res) => {
  let params_ = {
    fields: [
      "_id",
      "username",
      "email",
      "phonenumber",
      "isBlocked",
      "name",
      "createdAt"
    ],
    limit: parseInt(process.env.MAX_RECORD),
    offset: 0,
    condition: {
      type: "user"
    }
  };
  let totalUser = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    params_.offset = (req.params.start - 1) * process.env.MAX_RECORD;
  }
  userModel.count({ type: "user" }, (err, count) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalUser = count;
    userModel.list(params_, (err, users) => {
      if (err || !users.length > 0) {
        return res.status(200).json({ message: req.t("NO_RECORD_FOUND") });
      } else {
        return res.status(200).json({ users, totalUser, maxRecord });
      }
    });
  });
};
adminCtr.getVendors = (req, res) => {
  let params_ = {
    fields: [
      "_id",
      "username",
      "email",
      "phonenumber",
      "isBlocked",
      "verified",
      "createdAt"
    ],
    limit: parseInt(process.env.MAX_RECORD),
    offset: 0,
    condition: {
      type: "vendor"
    }
  };
  let totalVendor = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    params_.offset = (req.params.start - 1) * process.env.MAX_RECORD;
  }
  userModel.count({ type: "vendor" }, (err, count) => {
    if (err) {
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalVendor = count;
    userModel.list(params_, (err, vendors) => {
      if (err || !vendors.length > 0) {
        return res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
      } else {
        return res.status(200).json({ vendors, totalVendor, maxRecord });
      }
    });
  });
};
adminCtr.updateBlockStatus = (req, res) => {
  let blockStatus = {
    isBlocked: req.body.isBlocked
  };
  userModel
    .update({ _id: req.body.id }, blockStatus)
    .exec((err, updateSuccess) => {
      if (!err) {
        return res.status(200).json({ message: req.t("SUCCESS") });
      } else {
        return res.status(400).json({ message: req.t("PLEASE_TRY_AGAIN") });
      }
    });
};
adminCtr.updateVerification = (req, res) => {
  let verification = {
    verified: req.body.verified
  };
  userModel
    .update({ _id: req.body.id }, verification)
    .exec((err, updateSuccess) => {
      if (!err) {
        return res.status(200).json({ message: req.t("SUCCESS") });
      } else {
        return res.status(400).json({ message: req.t("PLEASE_TRY_AGAIN") });
      }
    });
};
adminCtr.searchUser = (req, res) => {
  let userName = req.body.username;
  let userType = req.params.type;
  let offset = 0;
  let totalUser = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * parseInt(process.env.MAX_RECORD);
  }
  userModel.count(
    {
      type: userType,
      $or: [
        { email: new RegExp(userName, "i") },
        { username: new RegExp(userName, "i") },
        { phonenumber: new RegExp(userName, "i") }
      ]
    },
    (err, count) => {
      if (err) {
        res.status(400).json(req.t("NO_RECORD_FOUND"));
      }
      totalUser = count;
      userModel
        .find(
        {
          type: userType,
          $or: [
            { email: new RegExp(userName, "i") },
            { username: new RegExp(userName, "i") },
            { phonenumber: new RegExp(userName, "i") }
          ]
        },
        {
          _id: 1,
          email: 1,
          username: 1,
          type: 1,
          phonenumber: 1,
          isBlocked: 1,
          name: 1
        },
        (err, userResults) => {
          if (userResults && userResults.length > 0) {
            res.status(200).json({ userResults, totalUser, maxRecord });
          } else {
            res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
          }
        }
        )
        .limit(parseInt(process.env.MAX_RECORD))
        .skip(offset);
    }
  );
};
adminCtr.getAll = (req, res) => {
  let offset = 0;
  let totalCoupons = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  console.log(req.params.start);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * process.env.MAX_RECORD;
    console.log(offset);
  }
  couponModel.count({}, (err, count) => {
    if (err) {
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalCoupons = count;
    couponModel.aggregate(
      [
        {
          $lookup: {
            from: "users",
            localField: "vendor_id",
            foreignField: "_id",
            as: "vendorcoupons"
          }
        },
        {
          $unwind: {
            path: "$vendorcoupons"
          }
        },
        {
          $group: {
            _id: "$_id",
            vendor_id: { $first: "$vendor_id" },
            vendor_name: { $first: "$vendorcoupons.name" },
            coupon_name: { $first: "$coupon_name" },
            discount_type: { $first: "$discount_type" },
            qupey_type: { $first: "$qupey_type" },
            discription: { $first: "$discription" },
            expiration_date: { $first: "$expiration_date" },
            createdAt: { $first: "$createdAt" },
            coupon_status: { $first: { $cond: [ { $eq: [ "$coupon_status", 'publish'] } , true, false ] }}
          }
        },
        { $limit: offset + parseInt(process.env.MAX_RECORD) },
        { $skip: offset },
        { $sort: { "createdAt": -1 } },
      ],
      function (err, couponResults) {
        if (couponResults.length > 0) {
          response = {
            data: couponResults,
            totalCoupon: totalCoupons,
            maxRecord: maxRecord,
            message: req.t("SUCCESS")
          };
          res.status(200).json(response);
        } else {
          res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
        }
      }
    );
  });
};
adminCtr.search = (req, res) => {
  let offset = 0;
  let totalUser = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  let searchTerm = req.body.coupon;
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * parseInt(process.env.MAX_RECORD);
  }
  couponModel.aggregate(
    [
      {
        $lookup: {
          from: "users",
          localField: "vendor_id",
          foreignField: "_id",
          as: "vendordetail"
        }
      },
      { $unwind: "$vendordetail" },
      {
        $match: {
          $or: [
            { "vendordetail.name": new RegExp(searchTerm, "i") },
            { coupon_name: new RegExp(searchTerm, "i") },
            { qupey_type: new RegExp(searchTerm, "i") }
          ]
        }
      },
      {
        $group: {
          _id: "$_id",
          vendor_id: { $first: "$vendor_id" },
          coupon_name: { $first: "$coupon_name" },
          vendor_name: { $first: "$vendordetail.name" },
          discount_type: { $first: "$discount_type" },
          qupey_type: { $first: "$qupey_type" },
          discription: { $first: "$discription" },
          expiration_date: { $first: "$expiration_date" },
          total_redeems: { $sum: 1 }
        }
      },
      { $limit: offset + parseInt(process.env.MAX_RECORD) },
      { $skip: offset }
    ],
    function (err, couponResults) {
      if (couponResults.length > 0) {
        response = {
          data: couponResults,
          message: req.t("SUCCESS")
        };
        res.status(200).json(response);
      } else {
        res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
      }
    }
  );
};
adminCtr.publishCoupon = (req, res) => {
  let couponId = req.body.id;
  let staus = { coupon_status: req.body.status };
  console.log(couponId, staus);
  couponModel.update({ _id: couponId }, staus).exec((err, updateSuccess) => {
    if (!err) {
      return res.status(200).json({ message: req.t("SUCCESS") });
    } else {
      return res.status(400).json({ message: req.t("PLEASE_TRY_AGAIN") });
    }
  });
};

adminCtr.getTopStore = (req, res) => {
  let totalVendor = 0;
  let offset = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * process.env.MAX_RECORD;
  }
  userModel.count({ type: "vendor" }, (err, count) => {
    if (err) {
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalVendor = count;
    userModel.aggregate(
      [
        {
          $match: {
            type: { $eq: "vendor" }
          }
        },
        {
          $lookup: {
            from: "redeems",
            localField: "_id",
            foreignField: "vendorId",
            as: "redeemsdetail"
          }
        },
        {
          $lookup: {
            from: "coupons",
            localField: "_id",
            foreignField: "vendor_id",
            as: "coupon"
          }
        },
        {
          $lookup: {
            from: "usersubscriptions",
            localField: "_id",
            foreignField: "vendor_id",
            as: "usersubscriptionsDetails"
          }
        },
        {
          $group: {
            _id: "$_id",
            vendor_name: { $first: "$name" },
            total_redeems: { $sum: { $size: "$redeemsdetail" } },
            apq: {
              "$sum": {
                "$size": {
                  "$setDifference": [
                    {
                      "$map": {
                        "input": "$coupon",
                        "as": "el",
                        "in": {
                          "$cond": [
                            { "$eq": ["$$el.qupey_type", "Advance Purchase Required"] },
                            "$$el",
                            false
                          ]
                        }
                      }
                    },
                    [false]
                  ]
                }
              }
            },
            regularQupeys: {
              "$sum": {
                "$size": {
                  "$setDifference": [
                    {
                      "$map": {
                        "input": "$coupon",
                        "as": "el",
                        "in": {
                          "$cond": [
                            { "$ne": ["$$el.qupey_type", "Advance Purchase Required"] },
                            "$$el",
                            false
                          ]
                        }
                      }
                    },
                    [false]
                  ]
                }
              }
            },
            totalQupeys: { $sum: { $size: "$coupon" } },
            apqRevenues: { $sum: { $sum: "$usersubscriptionsDetails.amount" } }
          }
        },
        {
          $sort: {
            "apqRevenues": -1,
            "totalQupeys": -1
          }
        },
        { $limit: offset + parseInt(process.env.MAX_RECORD) },
        { $skip: offset }
      ],
      (err, vendors) => {
        if (err || !vendors.length > 0) {
          return res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
        } else {
          return res.status(200).json({ vendors, totalVendor, maxRecord });
        }
      }
    );
  });

};
adminCtr.getTopUsers = (req, res) => {
  let totalUser = 0;
  let offset = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * process.env.MAX_RECORD;
  }
  userModel.count({ type: "user" }, (err, count) => {
    if (err) {
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalUser = count;
    userModel.aggregate(
      [
        {
          $match: {
            type: { $eq: "user" }
          }
        },
        {
          $lookup: {
            from: "redeems",
            localField: "_id",
            foreignField: "userId",
            as: "redeemsdetail"
          }
        },
        {
          $group: {
            _id: "$_id",
            user_name: { $first: "$name" },
            total_redeems: { $sum: { $size: "$redeemsdetail" } }
          }
        },
        {
          $sort: {
            "total_redeems": -1
          }
        },
        { $limit: offset + parseInt(process.env.MAX_RECORD) },
        { $skip: offset }
      ],
      (err, users) => {
        if (err || !users.length > 0) {
          return res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
        } else {
          return res.status(200).json({ users, totalUser, maxRecord });
        }
      }
    );
  });
};
adminCtr.getTotalCouponsPerVendor = (req, res) => {
  let totalVendor = 0;
  let offset = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * process.env.MAX_RECORD;
  }
  userModel.count({ type: "vendor" }, (err, count) => {
    if (err) {
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalVendor = count;
    userModel.aggregate(
      [
        {
          $match: {
            type: { $eq: "vendor" }
          }
        },
        {
          $lookup: {
            from: "coupons",
            localField: "_id",
            foreignField: "vendor_id",
            as: "couponsdetail"
          }
        },
        {
          $group: {
            _id: "$_id",
            vendor_name: { $first: "$name" },
            total_coupons: { $sum: { $size: "$couponsdetail" } }
          }
        },
        {
          $sort: {
            "total_coupons": -1
          }
        },
        { $limit: offset + parseInt(process.env.MAX_RECORD) },
        { $skip: offset }
      ],
      (err, vendors) => {
        if (err || !vendors.length > 0) {
          return res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
        } else {
          return res.status(200).json({ vendors, totalVendor, maxRecord });
        }
      }
    );
  });
};
adminCtr.getTotalCouponsRefeeredPerVendor = (req, res) => {
  let totalVendor = 0;
  let offset = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * process.env.MAX_RECORD;
  }
  userModel.count({ type: "vendor" }, (err, count) => {
    if (err) {
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalVendor = count;
    userModel.aggregate(
      [
        {
          $match: {
            type: { $eq: "vendor" }
          }
        },
        {
          $lookup: {
            from: "sharelinks",
            localField: "_id",
            foreignField: "vendorId",
            as: "sharelinksDetail"
          }
        },
        {
          $group: {
            _id: "$_id",
            vendor_name: { $first: "$name" },
            total_coupons: { $sum: { $size: "$sharelinksDetail" } }
          }
        },
        {
          $sort: {
            "total_coupons": -1
          }
        },
        { $limit: offset + parseInt(process.env.MAX_RECORD) },
        { $skip: offset }
      ],
      (err, vendors) => {
        if (err || !vendors.length > 0) {
          return res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
        } else {
          return res.status(200).json({ vendors, totalVendor, maxRecord });
        }
      }
    );
  });
};
adminCtr.getTotalCouponsRedeemedPerVendor = (req, res) => {
  let totalVendor = 0;
  let offset = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(req.params.start) && !isNaN(req.params.start)) {
    offset = (req.params.start - 1) * process.env.MAX_RECORD;
  }
  couponModel.count({}, (err, count) => {
    if (err) {
      return res.status(500).json({ error: "PLEASE_TRY_AGAIN" });
    }
    totalVendor = count;
    couponModel.aggregate(
      [
        {
          $lookup: {
            from: "users",
            localField: "vendor_id",
            foreignField: "_id",
            as: "usersDetail"
          }
        },
        { $unwind: "$usersDetail" },
        {
          $lookup: {
            from: "redeems",
            localField: "_id",
            foreignField: "couponId",
            as: "redeemsDetail"
          }
        },
        {
          $group: {
            _id: "$_id",
            coupon_name: { $first: "$coupon_name" },
            vendor_name: { $first: "$usersDetail.name" },
            total_coupons: { $sum: { $size: "$redeemsDetail" } }
          }
        },
        {
          $sort: {
            "total_coupons": -1
          }
        },
        { $limit: offset + parseInt(process.env.MAX_RECORD) },
        { $skip: offset }
      ],
      (err, vendors) => {
        if (err || !vendors.length > 0) {
          return res.status(400).json({ message: req.t("NO_RECORD_FOUND") });
        } else {
          return res.status(200).json({ vendors, totalVendor, maxRecord });
        }
      }
    );
  });
};

adminCtr.getTopHeaderData = (req, res) => {
  let findTotalApqQupey = {"qupey_type" : "Advance Purchase Required" };
  let findTotalRegularQupey = {"qupey_type" : {$ne: "Advance Purchase Required"}};
  
  Async.parallel({
    totalQupeys: function (cb) { couponModel.count({}, cb) },
    totalRegularQupeys: function (cb) { couponModel.count(findTotalRegularQupey, cb) },
    totalApqs: function (cb) { couponModel.count(findTotalApqQupey, cb) },
    totalRedeems: function(cb) { redeemsModel.count({}, cb)},
    totalApqRevenue: function (cb) { paymentModel.find({}, cb).select({"amount":1})}
  }, function (err, response) {
    
    if(!err){
      let totalAmount = 0;

      for(let i=0; i < response.totalApqRevenue.length; i++){
        totalAmount = totalAmount + response.totalApqRevenue[i].amount;
        if(i+1 == response.totalApqRevenue.length){
          response.totalApqRevenueData = totalAmount;
          return res.status(200).json({ response });
        }
      }
      
    }
  });
};

  module.exports = adminCtr;
