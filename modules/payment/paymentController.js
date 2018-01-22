let StripeUtility = require('../../helper/stripeUtils');
let jwt = require('../../helper/jwt');
let vendorModel = require('../vendor/vendorModel');
let paymentModel = require('./paymentModel.js');
let utils = require('../../helper/utils.js');
let logsModel = require('../logs/logsModel.js');
let userModel = require('../user/userModel');
let notificationUtility = require('../../helper/notificationUtils');
var paymentCtr = {}

paymentCtr.subscribeuser = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	console.log(userId);
	let stripeToken = req.body.token;
	userModel.findOne({ _id: userId }).exec((err, result) => {
		if (result) {
			//console.log(result);
			StripeUtility.createCustomerWithCard(result.email, null, stripeToken).then(function (customer) {
				let stripeCustomerId = customer.id;
				let updateValue = { stripeCustomerId: stripeCustomerId, isSubscribe: true };
				let condition = { _id: userId };

				utils.modifyField('users', condition, updateValue, (err1, result1) => {
					if (result1) {
						StripeUtility.createSubscription(stripeCustomerId, result.email, req.body.plan).then(function (subscription) {
							var now = new Date();
							let userField = { "isSubscribe": true, "expiryDate": now.setDate(now.getDate() + 30) }
							utils.modifyField("users", condition, userField, (err3, response) => {
								let fields = {
									vendor_id: userId,
									amount: subscription.plan.amount,
									currency: subscription.plan.currency,
									customerId: subscription.customer,
									subscriptionId: subscription.id,
									subscriptionPlan: req.body.plan
								}
								let subscriptions = new paymentModel(fields);
								subscriptions.save((err) => {
									let response = {
										"isSubscribe": true,
										"expiryDate": now.setDate(now.getDate() + 30),
										"message": req.t("SUBSCRIBE_SUCCESS")
									}
									let notifyMsg=req.t("NEW_BUSINESS_FIRST")+result.name+req.t("NEW_BUSINESS_LAST")
									let htmlMsg=req.t("DIV_DES_START")+ req.t("NEW_BUSINESS_FIRST") +req.t("SPAN_START")+result.name+req.t("SPAN_END")+req.t("NEW_BUSINESS_LAST")+req.t("DIV_END")
									userModel.find({"type":"user" ,"newBusinessNotify": true},(err,users)=>{
										let devices=users.map((user)=>{return {type:user.device_type,token:user.device_token} })
										notificationUtility.notifyToMany(devices,notifyMsg,htmlMsg)
									})
									
									return res.status(200).json(response);
								});
							});
						}, function (err) {
							res.status(400).json(err.message);
						});
					} else {
						return res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
					}
				});
			}, function (err) {

				res.status(400).json(err.message);
			});

		} else {
			res.status(400).json(req.t("NOT_VALID_USER"));
		}
	});
}
paymentCtr.cancelSubscription = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	console.log(userId);
	paymentModel.find({ vendor_id: userId }).sort({ _id: -1 }).limit(1).exec((err, result) => {

		StripeUtility.cancelSubscription(result[0].subscriptionId).then(function (subscription) {
			console.log(subscription);
			if (subscription) {

				let response = {
					"message": req.t("SUBSCRIBE_CANCEL_SUCCESS")
				}
				return res.status(200).json(response);
			}
		});
	});
}
paymentCtr.redeemUserSubscription = (req, res) => {

}
paymentCtr.updateVendorSubscription = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	console.log(userId);
	paymentModel.find({ vendor_id: userId }).sort({ _id: -1 }).limit(1).exec((err, result) => {
		console.log(result[0]);
		StripeUtility.updateSubscription(result[0].subscriptionId, result[0].subscriptionId, req.body.plan).then(function (subscription) {
			console.log(subscription);
			let fields = {
				vendor_id: userId,
				customerId: result[0].customerId,
				subscriptionId: result[0].subscriptionId,
				subscriptionPlan: req.body.plan
			}
			console.log(fields);
			let subscriptions = new paymentModel(fields);
			subscriptions.save((err) => {
				let response = { "message": req.t("SUBSCRIBE_SUCCESS") }
				return res.status(200).json(response);
			});

		});
	});
}

paymentCtr.webHook = (req, res) => {
	if (req.body.type == "customer.subscription.deleted") {
		let fields = {
			logsString: req.body,
			type: req.body.type,
			module: "Payment"
		}
		console.log(fields);
		let logs = new logsModel(fields);
		logs.save((err) => {
			console.log(err);
			let updateValue = { "isCouponCreate": false }
			paymentModel.findOne({ "customerId": req.body.data.customer }, (err, result) => {
				if (!err) {
					utils.modifyField('users', {"_id":result.vendor_id}, updateValue, (err1, result1) => {
						if (result1) {
							let response = { "message": req.t("SUCCESS") }
							return res.status(200).json(response);
						}
					})
				

				}

			})

		});
	} else if (req.body.type == "customer.subscription.trial_will_end") {
		let fields = {
			logsString: req.body,
			type: req.body.type,
			module: "Payment"
		}
		console.log(fields);
		let logs = new logsModel(fields);

		logs.save((err) => {
			console.log(err);
			let response = { "message": req.t("SUCCESS") }
			return res.status(200).json(response);
		});
	} else if (req.body.type == "customer.subscription.updated") {
		let fields = {
			logsString: req.body,
			type: req.body.type,
			module: "Payment"
		}
		console.log(fields);
		let logs = new logsModel(fields);

		logs.save((err) => {
			console.log(err);
			let response = { "message": req.t("SUCCESS") }
			return res.status(200).json(response);
		});
	} else if (req.body.type == "invoice.payment_failed") {
		let fields = {
			logsString: req.body,
			type: req.body.type,
			module: "Payment"
		}
		console.log(fields);
		let logs = new logsModel(fields);

		logs.save((err) => {
			console.log(err);
			let response = { "message": req.t("SUCCESS") }
			return res.status(200).json(response);
		});
	}
}

paymentCtr.checkStripeToken = (req, res) => {
	console.log(req.body);
	StripeUtility.stripeDummyToken(req.body.card).then(function (result) {
		res.status(200).json({ result: result });
	}, function (err) {
		res.status(err.statusCode).json(err.message);
	});

}

module.exports = paymentCtr;