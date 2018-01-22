//Dependencies 
let express = require('express');
let paymentCtr = require('./paymentController.js');
let paymentMiddleware = require('./paymentMiddleware.js');
let paymentRouter = express.Router();
let auth = require("../../helper/auth");
/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
*/
/**
 * @api {post} /payment/subscribe Pyament Subscribe For Vendor
 * @apiName subscribe 
 * @apiGroup Payment
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiUse TokenHeader
 * @apiParam {String} token Required
 * @apiParamExample Request Example:
 *		{
 *			 "token":"tok_1Ah9vQJiFQex2IAWaroABbfT"
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *  {
 *   "data" : {"isSubscribe" : true},
 *   "message": "Subscription successfullly done"	
 *  }
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {Subscription Failed}
 */
let subscribeMiddleware = [paymentMiddleware.validateInput('addCard'),paymentCtr.subscribeuser];
paymentRouter.post('/subscribe',subscribeMiddleware);

let checkToken = [paymentCtr.checkStripeToken];
paymentRouter.post('/get-token',checkToken);

let updateVendorSubscriptionMiddleware = [auth.requiresLogin, paymentCtr.updateVendorSubscription];
paymentRouter.post('/update-vendor-subscription', updateVendorSubscriptionMiddleware);
let cancelSubscriptionMiddleware = [auth.requiresLogin, paymentCtr.cancelSubscription];
paymentRouter.get('/cancel-subscription', cancelSubscriptionMiddleware);

let webHooklMiddleware = [paymentCtr.webHook];
paymentRouter.post('/web-hook',webHooklMiddleware);
module.exports = paymentRouter;