//Dependencies 
let express = require('express');
let couponCtr = require('./couponController.js');
let couponMiddleware = require('./couponMiddleware.js');
let auth = require("../../helper/auth");
let couponRouter = express.Router();
/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
 */
let createCouponMiddleware = [auth.requiresLogin,couponMiddleware.validateInput("createCoupon"),couponCtr.createCoupon];
couponRouter.post('/create-coupon', createCouponMiddleware);

let couponInventoryMiddleware = [auth.requiresLogin,couponCtr.currentCouponInventory];
couponRouter.get('/current-coupon-inventory/:start/:vendor_id', couponInventoryMiddleware);

let expireCouponInventoryMiddleware = [auth.requiresLogin,couponCtr.expireCouponInventory];
couponRouter.get('/expiry-coupon-inventory/:start', expireCouponInventoryMiddleware);

let getCouponInfoMiddleware = [auth.requiresLogin,couponCtr.getCoupon];
couponRouter.get('/getcoupon/:id',getCouponInfoMiddleware);
/**
 * @api {get} /coupon/coupon-count Coupon Count
 * @apiName Coupon Count
 * @apiGroup Coupon
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *{
 *  {
 *   "message": "SUCCESS"
 *  }
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"You have no more coupon to create as per you plan"}
 */
let getCouponCountMiddleware = [auth.requiresLogin,couponCtr.getCouponCount];
couponRouter.get('/coupon-count/',getCouponCountMiddleware);

let deleteCouponMiddleware = [auth.requiresLogin,couponCtr.deleteCoupon];
couponRouter.delete('/delete-coupon/:id',deleteCouponMiddleware);

let publishCouponMiddleware = [auth.requiresLogin,couponCtr.publishCoupon];
couponRouter.post('/publish-coupon/',publishCouponMiddleware);

let updateCouponMiddleware = [auth.requiresLogin,couponCtr.updateCoupon];
couponRouter.post('/update-coupon/',updateCouponMiddleware);

let redeemCouponMiddleware = [auth.requiresLogin,couponCtr.redeemCoupon];
couponRouter.post('/redeem-coupon/',redeemCouponMiddleware);

module.exports = couponRouter; 

